import { createOAuth1Client, PagedResultWithPager, ParamsOauth1, rqlBuilder, Schema } from '@extrahorizon/javascript-sdk';
import DeviceInfo from 'react-native-device-info';
import { HOST, REQUIRED_DOCUMENTS, SCHEMA_NAMES } from './constants';
import { retryUntil } from './helpers';
import { FibricheckSDK, Consent } from './types';
import { GeneralConfiguration, UserConfiguration } from './types/configuration';
import { Measurement, MeasurementResponseData } from './types/measurement';
import { ReportDocument, ReportDocumentData } from './types/report';

type Config = Pick<ParamsOauth1, 'consumerKey' | 'consumerSecret'>
/* function to parse a string like '1.5.0' to something like 'v150'
 * '1.5.0' format comes from the current documents
 * 'v150' format comes from the user's currenctly signed versions
 */

export const documentVersionParse = (value: string) => `v${value.replace(/\./g, '')}`;

export default (config: Config): FibricheckSDK => {
  const exhSdk = createOAuth1Client({ host: HOST, ...config });

  let schemas: Record<string, Schema>;
  let userId: string;

  return {
    register: exhSdk.users.createAccount,
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
        }).filter(value => value) as Consent[];

      if (documentsToSign.length > 0) {
        onConsentNeeded(documentsToSign);
      }

      const schemaList = await exhSdk.data.schemas.findAll({
        rql: rqlBuilder().in('name', Object.values(SCHEMA_NAMES)).select(['id', 'name']).build(),
      });

      userId = tokenData.userId as string;

      schemas = schemaList.reduce(
        (acc, schema) => ({ ...acc, [schema.name as string]: schema }),
        {}
      );

      return tokenData;
    },
    giveConsent: async (data: Omit<Consent, 'url'>) => {
      console.log('userId', userId);
      return await exhSdk.configurations.users.update(userId, {
        data: {
          documents: {
            [data.key]: {
              [documentVersionParse(data.version)]: {
                timestamp: new Date(),
              },
            },
          },
        },
      });
    },
    postMeasurement: async measurement => {
      const schema = schemas[SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS];
      const result = await exhSdk.data.documents.create<MeasurementResponseData>(schema.id as string, {
        ...measurement,
        device: {
          os: DeviceInfo.getSystemName(),
          model: DeviceInfo.getModel(),
          brand: DeviceInfo.getBrand(),
        },
        app: {
          build: Number(DeviceInfo.getBuildNumber()),
          name: 'mobile-spot-check',
          version: DeviceInfo.getVersion(),
        },
        measurement_timestamp: Date.now(),
      });

      return result as Measurement;
    },
    getMeasurement: async measurmentId => {
      const schema = schemas[SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS];
      return await exhSdk.data.documents.findById<MeasurementResponseData>(schema.id as string, measurmentId) as Measurement;
    },
    getMeasurements: async () => {
      const schema = schemas[SCHEMA_NAMES.FIBRICHECK_MEASUREMENTS];
      return await exhSdk.data.documents.find<MeasurementResponseData>(schema.id as string) as PagedResultWithPager<Measurement>;
    },
    getReport: async measurementId => {
      const schema = schemas[SCHEMA_NAMES.MEASUREMENT_REPORTS];
      let report = await exhSdk.data.documents.findFirst<ReportDocumentData>(schema.id as string, {
        rql: rqlBuilder()
          .eq('data.measurementId', measurementId)
          .build(),
      }) as ReportDocument;

      // report exists and is rendered. Return current document
      if (report?.status === 'rendered') {
        return report;
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
      return retryUntil<ReportDocument>(
        5,
        async () => await exhSdk.data.documents.findById<ReportDocumentData>(
          schema.id as string,
          report.id as string,
          { rql: rqlBuilder().eq('status', 'rendered').build() }
        ),
        (value: ReportDocument) => !!value
      );
    },
  };
};
