import { mockSdk } from '../../__mocks__/@extrahorizon/javascript-sdk';
import client from '../../src';
import { FibricheckSDK } from '../../src/types';
import {
  newUserData,
  userCredentials,
  mockClientParams,
  mockPrivacyPolicy,
} from '../__helpers__/authentication';

describe('authentication', () => {
  let sdk: FibricheckSDK;

  beforeAll(async () => {
    sdk = client(mockClientParams);
  });

  it('should register a new user', async () => {
    await sdk.register(newUserData);

    expect(mockSdk.users.createAccount).toBeCalledWith(newUserData);
  });

  it('should authenticate user', async () => {
    mockSdk.auth.authenticate.mockReturnValue({ userId: '' });
    mockSdk.configurations.general.get.mockReturnValue({ data: {} });
    mockSdk.configurations.users.get.mockReturnValue({ data: {} });
    mockSdk.data.schemas.findAll.mockReturnValue([]);
    await sdk.authenticate(userCredentials, () => ({}));

    expect(mockSdk.auth.authenticate).toBeCalledWith(userCredentials);
  });

  it('should authenticate user with updated legal documents', async () => {
    const onConsent = jest.fn();

    mockSdk.auth.authenticate.mockReturnValue({ userId: '' });
    mockSdk.configurations.general.get.mockReturnValue({ data: { documents: { privacyPolicy: mockPrivacyPolicy } } });
    mockSdk.configurations.users.get.mockReturnValue({ data: {} });
    mockSdk.data.schemas.findAll.mockReturnValueOnce([]);

    await sdk.authenticate(userCredentials, onConsent);

    expect(onConsent).toBeCalledWith([
      {
        key: 'privacyPolicy',
        url: mockPrivacyPolicy.url,
        version: mockPrivacyPolicy.version,
      },
    ]);

    expect(mockSdk.auth.authenticate).toBeCalledWith(userCredentials);
  });

  it('should give consent for legal documents', async () => {
    mockSdk.configurations.users.update.mockReturnValue({ affectedRecords: 1 });

    const { affectedRecords } = await sdk.giveConsent(
      {
        key: 'privacyPolicy',
        version: mockPrivacyPolicy.version,
      }
    );

    expect(affectedRecords).toBe(1);
  });
});
