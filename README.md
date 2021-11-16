# Getting Started

This package serves as a JavaScript wrapper around all [FibriCheck](https://www.fibricheck.com) cloud services.

To get started with the FibriCheck SDK you'll need to install it, and then get credentials which will allow you to access the backend.

## Installation

In your project, if you are using yarn or npm you need to create a file called `.npmrc` at the root level of your project and add these lines. Replace ${AUTH\_TOKEN} with your personal access token. You can get a new one at https://github.com/settings/tokens/new. Make sure you enable the `read:packages` scope.

```
@fibricheck:registry=https://npm.pkg.github.com
```

Alternatively, this file can be added/edited in your home directory and it will be applied to all projects.

Explanation from GitHub on how to add your token can be found here https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages

Using npm:

```shell
npm install @fibricheck/javascript-sdk
```

Using yarn:

```shell
yarn add @fibricheck/javascript-sdk
```

## Quick Start

```javascript
import client from "@fibricheck/javascript-sdk";

(async () => {
  const sdk = client({
    consumerKey: "",
    consumerSecret: "",
  });

  await sdk.authenticate({
    password: "",
    username: "",
  });
})();
```

## API

You can initialize the default export, the returned object will have the following interface.

```ts
export interface FibricheckSDK {
  /**
   * Create an account
   */
  register: (data: UserRegisterData) => Promise<UserData>;
  /**
   * Use token authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   */
  authenticate(credentials: ParamsOauth1WithToken,
    onConsentNeeded: (data: Consent[]) => void
  ): Promise<TokenDataOauth1>;
  /**
   * Use password authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   */
  authenticate(credentials: ParamsOauth1WithEmail,
    onConsentNeeded: (data: Consent[]) => void
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
  postMeasurement: (measurement: MeasurementCreationData) => Promise<Measurement>;
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
  getReportUrl: (measurementId: string) => Promise<string>;
}
```