import { createOAuth1Client, findAllIterator, LockedDocumentError, OptionsWithRql, PagedResult, ParamsOauth1, rqlBuilder, UserData } from '@extrahorizon/javascript-sdk';
import DeviceInfo from 'react-native-device-info';
import { API_SERVICES, DEV_HOST, PRODUCTION_HOST, REQUIRED_DOCUMENTS, SCHEMA_NAMES } from './constants';
import { retryForError, retryUntil } from './helpers';
import { FibricheckSDK, Consent } from './types';
import { GeneralConfiguration, UserConfiguration } from './types/configuration';
import { MeasurementCreationData, MeasurementResponseData, MeasurementStatus } from './types/measurement';
import { Prescription, PRESCRIPTION_STATUS } from './types/prescription';
import { PeriodicReport, ReportDocument, ReportDocumentData, ReportDocumentStatus, REPORT_STATUS } from './types/report';
import { version as fibricheckSdkVersion } from '../package.json';
import { FeatureData } from './types/featureData';
import { NotPaidError, AlreadyActivatedError } from './models/PrescriptionErrors';
import { NoActivePrescriptionError } from './models/MeasurementErrors';

type Env = 'dev' | 'production';
type Config = { env?: Env; } & Pick<ParamsOauth1, 'consumerKey' | 'consumerSecret' | 'requestLogger' | 'responseLogger'>;

/* function to parse a string like '1.5.0' to something like 'v150'
 * '1.5.0' format comes from the current documents
 * 'v150' format comes from the user's currently signed versions
 */
export const documentVersionParse = (value: string) => `v${value.replace(/\./g, '')}`;

/**
 * Create FibriCheck sdk client.
 *
 * @example
 * const sdk = client({
 *   env: 'dev',
 *   consumerKey: 'string',
 *   consumerSecret: 'string',
 * });
 * await sdk.authenticate({
 *   email: 'string',
 *   password: 'string',
 * });
 */
export default (config: Config): FibricheckSDK => {
  const env: Env = config.env ?? 'production';
  const host = env === 'production' ? PRODUCTION_HOST : DEV_HOST;
  const exhSdk = createOAuth1Client({ host, ...config });

  const canPerformMeasurement = async () => {
    const userId = await exhSdk.raw.userId as string;
    const rql = rqlBuilder().eq('data.userId', userId).build();

    const result = await exhSdk.data.documents.findFirst<FeatureData>(
      SCHEMA_NAMES.FEATURE_ALGO,
      { rql }
    );

    return !!result?.data?.canPerformMeasurement;
  };

  return {
    register: data => exhSdk.users.createAccount(data) as Promise<UserData>,
    logout: exhSdk.auth.logout,
    authenticate: async (credentials, onConsentNeeded) => {
      const tokenData = await exhSdk.auth.authenticate(credentials as any);

      const { data: generalConfiguration } = await exhSdk.configurations.general.get() as { data: GeneralConfiguration; };
      const { data: userConfig } = await exhSdk.configurations.users.get(tokenData.userId as string) as { data: UserConfiguration; };

      const documentsToSign: Consent[] =
        REQUIRED_DOCUMENTS.map(documentName => {
          const liveDocument = generalConfiguration?.documents?.[documentName];
          const userDocument = userConfig?.documents?.[documentName];

          if (liveDocument) {
            const liveVersion = documentVersionParse(liveDocument.version);
            if (!userDocument || (userDocument && !userDocument[liveVersion])) {
              return {
                key: documentName,
                version: liveDocument.version,
                url: liveDocument.url,
              } as Consent;
            }
          }
          return false;
        }).filter(value => value) as Consent[];

      if (documentsToSign.length > 0) {
        onConsentNeeded(documentsToSign);
      }

      return tokenData;
    },
    giveConsent: async (data: Omit<Consent, 'url'>) => exhSdk.configurations.users.update(await exhSdk.raw.userId as string, {
      data: {
        documents: {
          [data.key]: {
            [documentVersionParse(data.version)]: {
              timestamp: new Date(),
            },
          },
        },
      },
    }),
    canPerformMeasurement,
    postMeasurement: async (measurement, cameraSdkVersion) => {
      const isMeasurementAllowed = await canPerformMeasurement();
      if (!isMeasurementAllowed) {
        throw new NoActivePrescriptionError();
      }
      const androidId = await DeviceInfo.getAndroidId();
      return exhSdk.data.documents.create<MeasurementCreationData, MeasurementResponseData, MeasurementStatus>(
        SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS,
        {
          ...measurement,
          device: {
            os: DeviceInfo.getSystemVersion(),
            model: DeviceInfo.getModel(),
            manufacturer: DeviceInfo.getBrand(),
            type: androidId && androidId !== 'unknown' ? 'android' : 'ios',
          },
          app: {
            build: Number(DeviceInfo.getBuildNumber()),
            name: 'mobile-spot-check',
            version: DeviceInfo.getVersion(),
            fibricheck_sdk_version: fibricheckSdkVersion,
            camera_sdk_version: cameraSdkVersion,
          },
          tags: ['FibriCheck-sdk'],
        }
      );
    },
    updateMeasurementContext: (measurementId, measurementContext) => retryForError(
      2000,
      5,
      () => exhSdk.data.documents.update(SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS, measurementId, measurementContext),
      LockedDocumentError
    ),
    updateProfile: async profileData => {
      const userId = await exhSdk.raw.userId as string;
      const rql = rqlBuilder().eq('id', userId).build();

      return exhSdk.profiles.update(rql, profileData);
    },
    getMeasurement: async measurementId => exhSdk.data.documents.findById<MeasurementResponseData, MeasurementStatus>(
      SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS,
      measurementId
    ),
    getMeasurements: async () => {
      const userId = await exhSdk.raw.userId as string;
      const rql = rqlBuilder().eq('creatorId', userId).build();

      return exhSdk.data.documents.find<MeasurementResponseData, MeasurementStatus>(
        SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS,
        { rql }
      );
    },
    getMeasurementReportUrl: async measurementId => {
      let report = await exhSdk.data.documents.findFirst<ReportDocumentData, ReportDocumentStatus>(SCHEMA_NAMES.MEASUREMENT_REPORTS, {
        rql: rqlBuilder()
          .eq('data.measurementId', measurementId)
          .sort('-id')
          .build(),
      });
      let outdatedReport = false;

      if (report?.status === REPORT_STATUS.rendered) {
        const measurement = await exhSdk.data.documents.findById<MeasurementResponseData, MeasurementStatus>(
          SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS,
          measurementId
        );
        // Check if the report is generated with the latest data of the measurement.
        const reportLastUpdatedTimestamp = report.data.forMeasurementUpdatedTimestamp || 0;
        outdatedReport = measurement.updateTimestamp.getTime() > reportLastUpdatedTimestamp;
        if (!outdatedReport) {
          return `https://${host}/files/v1/${report?.data?.readFileToken}/file`;
        }
      }

      // if no report exists or if the report is outdated, (re)create
      const me = await exhSdk.users.me();
      if (!report || outdatedReport) {
        report = await exhSdk.data.documents.create<ReportDocumentData, ReportDocumentData, ReportDocumentStatus>(SCHEMA_NAMES.MEASUREMENT_REPORTS, {
          measurementId,
          language: me.language,
        });
      }

      // await rendered
      const result = await retryUntil<ReportDocument>(
        2000,
        15,
        () => exhSdk.data.documents.findById<ReportDocumentData>(
          SCHEMA_NAMES.MEASUREMENT_REPORTS,
          report.id as string,
          { rql: rqlBuilder().eq('status', REPORT_STATUS.rendered).build() }
        ),
        (value: ReportDocument) => !!value
      );

      return `https://${host}/files/v1/${result?.data?.readFileToken}/file`;
    },
    getPeriodicReports: async () => {
      const userId = await exhSdk.raw.userId as string;

      const rql = rqlBuilder()
        .eq('user_id', userId)
        .out('trigger', ['MANUAL'])
        .eq('status', REPORT_STATUS.COMPLETE)
        .sort('-creation_timestamp')
        .build();

      const find = async (options: OptionsWithRql) => {
        const { data } = await (exhSdk.raw.get<PagedResult<PeriodicReport>>(`${API_SERVICES.REPORTS}/${options.rql}`));
        return data;
      };

      return findAllIterator<PeriodicReport>(find, { rql });
    },
    activatePrescription: async hash => {
      const { data: prescription } = await exhSdk.raw.get<Prescription>(
        `${API_SERVICES.PRESCRIPTIONS}/${hash}`
      );

      switch (prescription.status) {
        case PRESCRIPTION_STATUS.ACTIVATED:
          throw new AlreadyActivatedError();
        case PRESCRIPTION_STATUS.NOT_PAID:
          throw new NotPaidError();
        case PRESCRIPTION_STATUS.PAID_BY_USER:
        case PRESCRIPTION_STATUS.PAID_BY_GROUP:
        case PRESCRIPTION_STATUS.FREE:
        default: {
          if (!prescription.userId) {
            // Link prescription to user
            await exhSdk.raw.get(`${API_SERVICES.PRESCRIPTIONS}/${hash}/scan`);
          }
          await exhSdk.raw.get(
            `${API_SERVICES.PRESCRIPTIONS}/${prescription.hash}/activate`
          );
        }
      }
    },
    getPeriodicReportPdf: async reportId => {
      const me = await exhSdk.users.me();
      const response = await exhSdk.raw.get<ArrayBuffer>(`/reports/v1/${reportId}/pdf/?language=${me.language}&time_zone=${me.timeZone}`, {
        responseType: 'arraybuffer',
      });
      return response.data;
    },
  };
};
