# Examples

## React component to make a measurement

Example showing how to hook the `react-native-camera-sdk` up with `javascript-sdk` to post the data returned from the camera to the backend

```ts
import client from '@fibricheck/javascript-sdk';
import { RNFibriCheckView } from '@fibricheck/react-native-camera-sdk';
import { useEffect } from 'react';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

const App = () => {
  useEffect(() => {
    sdk.authenticate({
      password: '',
      username: '',
    });
  },[]);

  return (
    <RNFibriCheckView
      onHeartBeat={heartRate => {
        console.log('heartRate', heartRate);
      }}
      onTimeRemaining={seconds => {
        console.log('onTimeRemaining', seconds);
      }}
      onMeasurementProcessed={async cameraData => {
        console.log('onMeasurementProcessed', cameraData);
        const measurement = await sdk.postMeasurement(cameraData);
        console.log('measurement',measurement);
      }}
      onFingerDetected={() => {
        console.log('finger detected');
      }}
    />
  );
};
```

## Registration 

```ts
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

const user = await sdk.register({
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'Strong!987',
  phoneNumber: '000000',
  birthDay: '1970/01/01',
  gender: 0,
  country: 'JO', // or 'AE'
  language: 'AR'
})

```

## Legal documents updated

Example showing how to hook changes to legal documents with your application.

```ts
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

sdk.authenticate({
  password: '',
  username: '',
}, function onConsentNeeded(legalDocumentsUpdated) {
  /* Will return an array of objects with a key, version and url.
  * ie. 
  *   [{ 
  *     key: 'privacyPolicy',
  *     version: '1.5.0', 
  *     url: 'https://fibricheck.com/privacyPolicy/150'
  *   }]
  */

  legalDocumentsUpdated.forEach(document => {
    // 1. Request approval from the user

    // 2. Pass the document back to the sdk
    sdk.giveConsent(document);
  });

});

```

## Authentication with Authorization Code Grant flow

```ts
import { Linking } from 'react-native';
import { parse } from 'query-string';
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

const redirectUri = 'myapp://login';
const url = sdk.getAuthorizationLink(redirectUri);
// 1. Request an authorization link
// https://pages.dev.fibricheck.com/authorize/?client_id=CLIENT_ID&response_type=code&redirect_uri=myapp://login

// 2. User leave the App
Linking.openUrl(url);

// 3. Capture the user returning to the app
// More info: https://reactnative.dev/docs/linking#getinitialurl
const returnUrl = Linking.getInitialUrl();

const { code } = parse(returnUrl.split('?')[1]);

sdk.authenticate({
  code
});
```