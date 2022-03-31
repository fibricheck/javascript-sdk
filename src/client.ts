import { createOAuth1Client, findAllIterator, OptionsWithRql, PagedResult, PagedResultWithPager, ParamsOauth1, rqlBuilder, Schema, UserData, UserNotAuthenticatedError } from '@extrahorizon/javascript-sdk';
import DeviceInfo from 'react-native-device-info';
import { API_SERVICES, DEV_HOST, PRODUCTION_HOST, REQUIRED_DOCUMENTS, SCHEMA_NAMES } from './constants';
import { retryUntil } from './helpers';
import { FibricheckSDK, Consent } from './types';
import { GeneralConfiguration, UserConfiguration } from './types/configuration';
import { Measurement, MeasurementResponseData } from './types/measurement';
import { Prescription, PRESCRIPTION_STATUS } from './types/prescription';
import { PeriodicReport, ReportDocument, ReportDocumentData, REPORT_STATUS } from './types/report';
import { version as fibricheckSdkVersion } from '../package.json';

type Env = 'dev' | 'production';
type Config = { env?: Env; } & Pick<ParamsOauth1, 'consumerKey' | 'consumerSecret'>
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
  const getSchemaById = (function getSchema() {
    let schemas: Record<string, Schema>;

    return async (schemaId: string) => {
      try {
        if (!schemas) {
          const schemaList = await exhSdk.data.schemas.findAll({
            rql: rqlBuilder().in('name', Object.values(SCHEMA_NAMES)).select(['id', 'name']).build(),
          });

          schemas = schemaList.reduce(
            (acc, schema) => ({ ...acc, [schema.name as string]: schema }),
            {}
          ) as Record<string, Schema>;
        }
        return schemas?.[schemaId];
      } catch (error: any) {
        if (error instanceof UserNotAuthenticatedError) {
          throw Error(`
Looks like you forgot to authenticate. Please check the README file to get started.  
As example you can authenticate using this snippet:

const sdk = client({
  consumerKey: '${config.consumerKey}',
  consumerSecret: '${config.consumerSecret}'
});

await sdk.authenticate({
  email: '',
  password: '',
});
`);
        } else {
          throw error;
        }
      }
    };
  }());

  return {
    register: data => exhSdk.users.createAccount(data) as Promise<UserData>,
    logout: exhSdk.auth.logout,
    authenticate: async (
      credentials,
      onConsentNeeded
    ) => {
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
    giveConsent: async (data: Omit<Consent, 'url'>) => await exhSdk.configurations.users.update(await exhSdk.raw.userId as string, {
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
    postMeasurement: async (measurement, cameraSdkVersion) => {
      const schema = await getSchemaById(SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS);
      const result = await exhSdk.data.documents.create<MeasurementResponseData>(schema.id as string, {
        ...measurement,
        device: {
          os: DeviceInfo.getSystemVersion(),
          model: DeviceInfo.getModel(),
          manufacturer: DeviceInfo.getBrand(),
          type: await DeviceInfo.getAndroidId() ? 'android' : 'ios',
        },
        app: {
          build: Number(DeviceInfo.getBuildNumber()),
          name: 'mobile-spot-check',
          version: DeviceInfo.getVersion(),
          fibricheck_sdk_version: fibricheckSdkVersion,
          camera_sdk_version: cameraSdkVersion,
        },
        tags: ['FibriCheck-sdk'],
      });

      return result as Measurement;
    },
    getMeasurement: async measurementId => {
      const schema = await getSchemaById(SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS);
      return await exhSdk.data.documents.findById<MeasurementResponseData>(schema.id as string, measurementId) as Measurement;
    },
    getMeasurements: async () => {
      const schema = await getSchemaById(SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS);
      const userId = await exhSdk.raw.userId as string;
      const rql = rqlBuilder().eq('creatorId', userId).build();
      return await exhSdk.data.documents.find<MeasurementResponseData>(schema?.id as string, { rql }) as PagedResultWithPager<Measurement>;
    },
    getMeasurementReportUrl: async measurementId => {
      const schema = await getSchemaById(SCHEMA_NAMES.MEASUREMENT_REPORTS);
      let report = await exhSdk.data.documents.findFirst<ReportDocumentData>(schema.id as string, {
        rql: rqlBuilder()
          .eq('data.measurementId', measurementId)
          .build(),
      }) as ReportDocument;

      // report exists and is rendered. Return current report url
      if (report?.status === REPORT_STATUS.rendered) {
        return `https://${host}/files/v1/${report?.data?.readFileToken}/file`;
      }

      // if no report exists, create it
      const me = await exhSdk.users.me();
      if (!report) {
        report = await exhSdk.data.documents.create<ReportDocumentData>(schema.id as string, {
          measurementId,
          language: me.language,
        }) as ReportDocument;
      }

      // await rendered
      const result = await retryUntil<ReportDocument>(
        2000,
        15,
        async () => await exhSdk.data.documents.findById<ReportDocumentData>(
          schema.id as string,
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
          throw new Error('alreadyActivated');
        case PRESCRIPTION_STATUS.NOT_PAID:
          throw new Error('notPaid');
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
      const response = await exhSdk.raw.get<ArrayBuffer>(`/reports/v1/${reportId}/pdf`, {
        responseType: 'arraybuffer',
      });
      return response.data;
    },
  };
};
