import { mockSdk } from '../../__mocks__/@extrahorizon/javascript-sdk';
import client from '../../src';
import { FibricheckSDK } from '../../src/types';
import { mockClientParams, userCredentials } from '../__helpers__/authentication';
import { cameraResult, mockApp, mockDevice, mockSchemas } from '../__helpers__/measurement';
import { featureDataAllowedToMeasureMock, featureDataNotAllowedToMeasureMock } from '../__helpers__/featureData';
import { NoActivePrescriptionError } from '../../src/models/MeasurementErrors';

describe('measurement', () => {
  let sdk: FibricheckSDK;

  beforeAll(async () => {
    sdk = client(mockClientParams);
    mockSdk.auth.authenticate.mockReturnValue({ userId: '' });
    mockSdk.configurations.general.get.mockReturnValue({ data: {} });
    mockSdk.configurations.users.get.mockReturnValue({ data: {} });
    mockSdk.data.schemas.findAll.mockResolvedValue(mockSchemas);

    await sdk.authenticate(userCredentials, () => ({}));
  });

  it('should post a measurement', async () => {
    (mockSdk.raw as any).userId = 'mockId';
    mockSdk.data.documents.findFirst.mockResolvedValue({ data: featureDataAllowedToMeasureMock });

    await sdk.postMeasurement(cameraResult, '1.0.0');

    expect(mockSdk.data.documents.create).toBeCalledWith('fibricheck-measurements', {
      ...cameraResult,
      app: mockApp,
      device: mockDevice,
      tags: ['FibriCheck-sdk'],
    });
  });

  it('throws when not allowed to post a measurement', async () => {
    (mockSdk.raw as any).userId = 'mockId';
    mockSdk.data.documents.findFirst.mockResolvedValue({ data: featureDataNotAllowedToMeasureMock });

    await expect(sdk.postMeasurement).rejects.toBeInstanceOf(NoActivePrescriptionError);
  });

  it('should fetch a measurement', async () => {
    await sdk.getMeasurement('test_id');

    expect(mockSdk.data.documents.findById).toBeCalledWith('fibricheck-measurements', 'test_id');
  });

  it('should fetch all measurements', async () => {
    (mockSdk.raw as any).userId = 'mockId';

    await sdk.getMeasurements();

    expect(mockSdk.data.documents.find).toBeCalledWith(
      'fibricheck-measurements',
      { rql: '?eq(creatorId,mockId)' }
    );
  });
});
