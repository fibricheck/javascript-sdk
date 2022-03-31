import { mockSdk } from '../../__mocks__/@extrahorizon/javascript-sdk';
import client from '../../src';
import { mockClientParams } from '../__helpers__/authentication';
import { mockSchemas } from '../__helpers__/measurement';
import { API_SERVICES } from '../../src/constants';

const sdk = client(mockClientParams);

const basePrescription = {
  id: '583c01b846e0fb0005d63dd9',
  creator_id: '58074849b2148f3b28ad770c',
  reference: 'RENG7QD1',
  hash: '123456789',
  status: 'FREE',
  group_id: '5811be2446e0fb000530a45f',
  duration: 7776000000,
  price: 4500,
  package_id: '57aa188bc0761534ac92909e',
  logs: [
    {
      old_status: 'NOT_PAID',
      new_status: 'FREE',
      timestamp: 1480327608763,
    },
  ],
  paid_timestamp: 1480327608763,
  creation_timestamp: 1480327608763,
  update_timestamp: 1480327608763,
};

describe('prescription', () => {
  beforeAll(() => {
    mockSdk.auth.authenticate.mockReturnValue({ userId: '' });
    mockSdk.configurations.general.get.mockReturnValue({ data: {} });
    mockSdk.configurations.users.get.mockReturnValue({ data: {} });
    mockSdk.data.schemas.findAll.mockResolvedValue(mockSchemas);
  });

  it('activates an unlinked prescription successfully', async () => {
    const freePrescription = {
      ...basePrescription,
      status: 'FREE',
    };
    mockSdk.raw.get.mockResolvedValue({ data: freePrescription });
    await sdk.activatePrescription('123456789');

    expect(mockSdk.raw.get.mock.calls[0][0]).toEqual(`${API_SERVICES.PRESCRIPTIONS}/123456789`);
    expect(mockSdk.raw.get.mock.calls[1][0]).toEqual(`${API_SERVICES.PRESCRIPTIONS}/123456789/scan`);
    expect(mockSdk.raw.get.mock.calls[2][0]).toEqual(`${API_SERVICES.PRESCRIPTIONS}/123456789/activate`);
  });

  it('activates a linked prescription successfully', async () => {
    const linkedPrescription = {
      ...basePrescription,
      userId: '58074849b2148f3b28ad770c',
    };
    mockSdk.raw.get.mockResolvedValue({ data: linkedPrescription });
    await sdk.activatePrescription('123456789');

    expect(mockSdk.raw.get.mock.calls[0][0]).toEqual(`${API_SERVICES.PRESCRIPTIONS}/123456789`);
    expect(mockSdk.raw.get.mock.calls[1][0]).toEqual(`${API_SERVICES.PRESCRIPTIONS}/123456789/activate`);
  });

  it('throws with an already activated prescription', async () => {
    const activatedPrescription = {
      ...basePrescription,
      status: 'ACTIVATED',
    };
    mockSdk.raw.get.mockResolvedValue({ data: activatedPrescription });
    try {
      await sdk.activatePrescription('123456789');
    } catch (error) {
      expect(error).toEqual(new Error('alreadyActivated'));
    }
  });

  it('throws with an unpaid prescription', async () => {
    const activatedPrescription = {
      ...basePrescription,
      status: 'NOT_PAID',
    };
    mockSdk.raw.get.mockResolvedValue({ data: activatedPrescription });
    try {
      await sdk.activatePrescription('123456789');
    } catch (error) {
      expect(error).toEqual(new Error('notPaid'));
    }
  });

  afterEach(() => {
    jest.resetAllMocks();
  });
});
