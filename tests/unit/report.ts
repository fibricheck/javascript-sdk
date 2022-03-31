import { mockSdk } from '../../__mocks__/@extrahorizon/javascript-sdk';
import client from '../../src';
import { FibricheckSDK } from '../../src/types';
import { mockClientParams, userCredentials } from '../__helpers__/authentication';
import { mockSchemas } from '../__helpers__/report';

describe('report', () => {
  let sdk: FibricheckSDK;

  beforeAll(async () => {
    sdk = client(mockClientParams);
    mockSdk.auth.authenticate.mockReturnValue({ userId: '' });
    mockSdk.configurations.general.get.mockReturnValue({ data: {} });
    mockSdk.configurations.users.get.mockReturnValue({ data: {} });
    mockSdk.data.schemas.findAll.mockResolvedValue(mockSchemas);

    await sdk.authenticate(userCredentials, () => ({}));
  });

  it('should get a report url for existing report', async () => {
    mockSdk.data.documents.findFirst.mockResolvedValue({ id: 'reportId', status: 'rendered', data: { readFileToken: 'token' } });

    const reportUrl = await sdk.getMeasurementReportUrl('measurementId');

    expect(reportUrl).toBe('https://api.fibricheck.com/files/v1/token/file');
  });

  it('should get a report url for new report', async () => {
    mockSdk.users.me.mockResolvedValue({ language: 'nl' });
    mockSdk.data.documents.findFirst.mockResolvedValue(null);
    mockSdk.data.documents.create.mockResolvedValue({ id: 'reportId' });
    mockSdk.data.documents.findById.mockResolvedValueOnce(null);
    mockSdk.data.documents.findById.mockResolvedValueOnce(null);
    mockSdk.data.documents.findById.mockResolvedValueOnce({
      id: 'reportId',
      data: { readFileToken: 'token' },
    });

    const reportUrl = await sdk.getMeasurementReportUrl('measurementId');

    expect(reportUrl).toBe('https://api.fibricheck.com/files/v1/token/file');
  });
});
