# Examples

## React component to make a measurement

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

## Legal documents updated

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
