# Getting Started

This package serves as a JavaScript wrapper around all [FibriCheck](https://www.fibricheck.com) cloud services.

To get started with the FibriCheck SDK you'll need to install it, and then get credentials which will allow you to access the backend.

## Installation

In your project, if you are using yarn or npm you need to create a file called `.npmrc` at the root level of your project and add these lines. Replace ${AUTH\_TOKEN} with your personal access token. You can get a new one at [here](https://github.com/settings/tokens/new). Make sure you enable the `read:packages` scope.

```
@extrahorizon:registry=https://npm.pkg.github.com
@fibricheck:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```

Alternatively, this file can be added/edited in your home directory and it will be applied to all projects.

Explanation from GitHub on how to add your token can be found [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages).

Using npm:

```shell
npm install --save @fibricheck/javascript-sdk react-native-device-info
```

Using yarn:

```shell
yarn add @fibricheck/javascript-sdk react-native-device-info
```

## Quick Start

To be able to receive data from the FibriCheck cloud services, an app should authenticate with a username/password or token/tokenSecret combination.

```javascript
import client from '@fibricheck/javascript-sdk';

(async () => {
  const sdk = client({
    consumerKey: '',
    consumerSecret: '',
  });

  await sdk.authenticate({
    username: '',
    password: '',
  });
})();
```

The client method (default export) supports several options you may set to achieve the expected behavior:

| Name             | Default      | Description                                       |
| ---------------- | ------------ | ------------------------------------------------- |
| `env`            | `production` | Specifies the environment you connect to          |
| `consumerKey`    |              | **Required**. Your application's `consumerKey`    |
| `consumerSecret` |              | **Required**. Your application's `consumerSecret` |

## API

When you initialize the sdk, the returned object will have the following interface. These descriptions and signatures are also available as inline JSDoc in your IDE.

```typescript
interface FibricheckSDK {
  /**
   * Create an account
   *
   * @param requestBody UserRegisterData
   * @returns User
   * @throws {EmailUsedError}
   */
  register: (data: UserRegisterData) => Promise<UserData>;
  /**
   * Use token authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   * @see https://docs.fibricheck.com/examples#legal-documents-updated
   * @example
   * await sdk.auth.authenticate({
   *   token: '',
   *   tokenSecret: '',
   * });
   * @throws {ApplicationNotAuthenticatedError}
   * @throws {AuthenticationError}
   * @throws {LoginTimeoutError}
   * @throws {LoginFreezeError}
   * @throws {TooManyFailedAttemptsError}
   * @throws {MfaRequiredError}
   */
  authenticate(credentials: ParamsOauth1WithToken,
    onConsentNeeded: (data: Consent[]) => void
  ): Promise<TokenDataOauth1>;
  /**
   * Use password authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   * @see https://docs.fibricheck.com/examples#legal-documents-updated
   * @example
   * await sdk.auth.authenticate({
   *   email: '',
   *   password: '',
   * });
   * @throws {ApplicationNotAuthenticatedError}
   * @throws {AuthenticationError}
   * @throws {LoginTimeoutError}
   * @throws {LoginFreezeError}
   * @throws {TooManyFailedAttemptsError}
   * @throws {MfaRequiredError}
   */
  authenticate(credentials: ParamsOauth1WithEmail,
    onConsentNeeded: (data: Consent[]) => void
  ): Promise<TokenDataOauth1>;
  /**
   *  Logout
   *  @returns {boolean} Success
   *  @example
   *  await sdk.authenticate({
   *    password: '',
   *    username: '',
   *  });
   *  sdk.auth.logout();
   */
  logout: () => boolean;
  /**
   * Return documents received from the `onConsentNeeded` callback on authentication after the user has approved them.
   * @params {Omit<Consent, 'url'>} data
   * @returns AffectedRecords
   */
  giveConsent: (data: Omit<Consent, 'url'>) => Promise<AffectedRecords>;
  /**
   * Send a measurement to the cloud.
   * @see https://docs.fibricheck.com/examples#react-component-to-make-a-measurement
   * @params {MeasurementCreationData} measurementData
   * @throws {NoActivePrescriptionError}
   * @returns {Promise<Measurement>} measurement
   */
  postMeasurement: (measurement: MeasurementCreationData, cameraSdkVersion?: string) => Promise<Measurement>;
  /**
   * Check if the user is entitled to perform a measurement
   * @returns {Promise<Measurement>} measurement
   */
  canPerformMeasurement: () => Promise<boolean>;
  /**
   * Add context to an existing measurement
   * @param {string} measurementId
   * @params {MeasurementError} measurementContext
   * @throws {LockedDocumentError}
   * @returns AffectedRecords
   */
  updateMeasurementContext: (measurementId: string, measurementContext: MeasurementContext) => Promise<AffectedRecords>;
  /**
   * Update the user profile
   * @param {string} userId
   * @params {ProfileData} profileData
   * @returns AffectedRecords
   */
  updateProfile: (userId: string, profileData: ProfileData) => Promise<AffectedRecords>;
  /**
   * Gets a measurement by measurementId
   * @param {string} measurementId
   * @returns {Promise<Measurement>} measurement
   */
  getMeasurement: (measurementId: string) => Promise<Measurement>;
  /**
   * Gets all measurements for the current user
   * @returns {Promise<PagedResult<Measurement>>} measurements
   */
  getMeasurements: () => Promise<PagedResult<Measurement>>;
  /**
   * Returns an url that can be used to render or download the report as PDF.
   * @see https://docs.fibricheck.com/examples#requesting-a-measurement-report-and-rendering-pdf
   * @returns {string} url
   */
  getMeasurementReportUrl: (measurementId: string) => Promise<string>;
  /**
   * Gets a list of periodic reports
   * @returns {FindAllIterator<PeriodicReport>} periodicReports
   */
  getPeriodicReports: () => Promise<FindAllIterator<PeriodicReport>>;
  /**
   * Get the pdf of a periodic report
   * @returns {pdf} pdf
   */
  getPeriodicReportPdf: (reportId: string) => Promise<ArrayBuffer>;
  /**
   * Activates a prescription hash, so the user can perform a measurement
   * @throws {NoActivePrescriptionError}
   * @throws {AlreadyActivatedError}
   */
  activatePrescription: (hash: string) => Promise<void>;
}

```
