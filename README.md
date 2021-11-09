# Getting started

This package serves as a JavaScript wrapper around all [FibriCheck](https://www.fibricheck.com/) cloud services.

To get started with the FibriCheck SDK you'll need to install it, and then get credentials which will allow you to access the backend.

## Installation

In your project, if you are using yarn or npm you need to create a file called `.npmrc` at the root level of your project and add these lines. Replace ${AUTH_TOKEN} with your personal access token. You can get a new one at https://github.com/settings/tokens/new. Make sure you enable the `read:packages` scope.

```
@extrahorizon:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${AUTH_TOKEN}
```

Alternatively, this file can be added/edited in your home directory and it will be applied to all projects.

Explanation from GitHub on how to add your token can be found here https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-to-github-packages

Using npm:

```sh
npm install @fibricheck/javascript-sdk
```

Using yarn:

```sh
yarn add @fibricheck/javascript-sdk
```

## Quick Start

```ts
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
