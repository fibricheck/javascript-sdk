# Examples

## First time authentication to save token/tokenSecret

You can use your email/password combination initially to retrieve an OAuth1 token/secret combination which you can use on to reauthenticate when reloading the application. In this example `@react-native-async-storage/async-storage` is used, but you can use any persistent storage system.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

(async () => {

  const sdk = client({
    consumerKey: '',
    consumerSecret: '',
  });

  const tokenData = await sdk.authenticate({
    email: '',
    password: '',
  });

  AsyncStorage.setItem('tokenData', JSON.stringify(tokenData));

})();
```

Afterwards you can use the stored tokenData to authenticate.

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
(async () => {

  const tokenDataString = await AsyncStorage.getItem('tokenData');
  const tokenData = JSON.parse(tokenDataString);

  await sdk.auth.authenticate({
    token: tokenData.key,
    tokenSecret: tokenData.secret,
  });

})();
```

## Camera SDK component to make a measurement

You can use the `RNFibriCheckView` exported from the  `@fibricheck/react-native-camera-sdk` package to perform a measurement and hook up `sdk.postMeasurement` to post the data returned from the camera to the backend in the `onMeasurementProcessed` event.

```typescript
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
      token: '',
      tokenSecret: '',
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

The following snippet shows how you can register a new user. You do not need authentication for registration.

```typescript
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

When you use the `authentication` function, the second parameter should be a callback function (this can also be an arrow function). This function will be called when legal documents have been updated in the FibriCheck cloud and the end-user needs to reapprove these. Example showing how to hook changes to legal documents change with your application and calling the `giveConsent` function with the document after the user has approved these.

```typescript
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


## Fetching one measurement

Use the `sdk.getMeasurement` function to get a single measurement based on a id. Only measurements for the currently authenticated user can be requested.

```typescript
import client from '@fibricheck/javascript-sdk';


const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

sdk.authenticate({
  token: '',
  tokenSecret: '',
});

const measurementId = '0000';
const measurement = await sdk.getMeasurement(measurementId);
```


## Fetching all your measurements

Using `sdk.getMeasurements` will return a paginated result with all measurements for the currently authenticated user. You can find the measurements under the `data` property. You can also use the `next` and `previous` functions present on the result to navigate through the user's measurents.

```typescript
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

sdk.authenticate({
  token: '',
  tokenSecret: '',
});

// Returns the first 20 measurements
const measurements = await sdk.getMeasurements();

// Returns the next 20 measurements
const nextMeasurements = await measurements.next();
```

## Requesting a measurement report and rendering PDF

The `sdk.getReportUrl` accepts a `measurementId` and will handle creation / fetching of the report. This function works great in combination with `react-native-pdf` or `react-native-share`

- first time calling this function for a measurement, it will take a little longer as the cloud service will render the report. Once it is ready (~5s) the url where you can fetch it will be returned
- subsequent calls will be much faster, as the report is already rendered and the url will be returned almost instantly.

```typescript
import client from '@fibricheck/javascript-sdk';
import Pdf from 'react-native-pdf';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

sdk.authenticate({
  token: '',
  tokenSecret: '',
});

const measurementId = '0000';

const App = () => {
  const [uri,setUri] = useState();

  useEffect(()=> {
    (async ()=> {
      const uri = await sdk.getReportUrl(measurementId);
      setUri(uri)
    })();
  },[])

  return (
    <Pdf
      source={{
        uri
      }}
    />
  );
}
```
