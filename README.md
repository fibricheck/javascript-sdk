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
   */
  register: (data: UserRegisterData) => Promise<UserData>;
  /**
   * Use token authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   */
  authenticate(
    credentials: ParamsOauth1WithToken,
    onConsentNeeded: (data: Consent[]) => void,
  ): Promise<TokenDataOauth1>;
  /**
   * Use password authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   */
  authenticate(
    credentials: ParamsOauth1WithEmail,
    onConsentNeeded: (data: Consent[]) => void,
  ): Promise<TokenDataOauth1>;
  /**
   *  Logout
   */
  logout: () => boolean;
  /**
   * Return documents received from the `onConsentNeeded` callback on authentication after the user has approved them.
   */
  giveConsent: (data: Omit<Consent, 'url'>) => Promise<AffectedRecords>;
  /**
   * Send a measurement to the cloud.
   */
  postMeasurement: (
    measurement: MeasurementCreationData,
  ) => Promise<Measurement>;
  /**
   * Gets a measurement by measurementId
   */
  getMeasurement: (measurementId: string) => Promise<Measurement>;
  /**
   * Gets all measurements for the current user
   */
  getMeasurements: () => Promise<PagedResult<Measurement>>;
  /**
   * Returns an url that can be used to render or download the report as PDF.
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
   * Activates a given prescription hash, so the user can perform a measurement
   * @throws {alreadyActivated}
   * @throws {notPaid}
   */
  activatePrescription: (hash: string) => Promise<void>;
}
```
