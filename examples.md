---
description: >-
  This page contains some examples to get you started on using the SDK. For
  completeness, every example includes the creation and authentication of the
  SDK. This is of course not necessary and should be
---

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

  await sdk.authenticate({
    token: tokenData.key,
    tokenSecret: tokenData.secret,
  });
})();
```

## Perform a measurement with the Camera SDK component

You can use the `RNFibriCheckView` exported from the `@fibricheck/react-native-camera-sdk` package to perform a measurement and hook up `sdk.postMeasurement` to post the data returned from the camera to the backend in the `onMeasurementProcessed` event.

* It is highly recommended to provide the camera sdk version as a second argument, as shown in the example.

```typescript
import client from '@fibricheck/javascript-sdk';
import { RNFibriCheckView } from '@fibricheck/react-native-camera-sdk';
import { useEffect } from 'react';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate({
  token: '',
  tokenSecret: '',
});

const App = () => {
  return (
    <RNFibriCheckView
      onHeartBeat={(heartRate) => {
        console.log('heartRate', heartRate);
      }}
      onTimeRemaining={(seconds) => {
        console.log('onTimeRemaining', seconds);
      }}
      onMeasurementProcessed={async (cameraData) => {
        console.log('onMeasurementProcessed', cameraData);
        const measurement = await sdk.postMeasurement(cameraData, RNFibriCheckView.version);
        console.log('measurement', measurement);
      }}
      onFingerDetected={() => {
        console.log('finger detected');
      }}
    />
  );
};
```

In some rare cases, it can occur that the motion sensors don't provide the correct data. In such cases, the movement detection will kick in, although the user is not moving. A way to fix this, is to disable the motion sensors by setting the `movementDetectionEnabled` to false on for example a `onLongPress`

## Register a new user

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
  gender: 0, // 0 = Not known; 1 = Male; 2 = Female; 9 = Not applicable
  country: 'JO', // or 'AE'
  language: 'AR',
});
```

## Check for updated legal documents

When you use the `authentication` function, the second parameter should be a callback function (this can also be an arrow function). This function will be called when legal documents have been updated in the FibriCheck cloud and the end-user needs to reapprove these. Example showing how to hook changes to legal documents change with your application and calling the `giveConsent` function with the document after the user has approved these.

```typescript
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate(
  {
    password: '',
    username: '',
  },
  function onConsentNeeded(legalDocumentsUpdated) {
    /* Will return an array of objects with a key, version and url.
     * ie.
     *   [{
     *     key: 'privacyPolicy',
     *     version: '1.5.0',
     *     url: 'https://fibricheck.com/privacyPolicy/150'
     *   }]
     */

    legalDocumentsUpdated.forEach((document) => {
      // 1. Request approval from the user

      // 2. Pass the document back to the sdk
      sdk.giveConsent(document);
    });
  },
);
```

## Fetch a measurement

Use the `sdk.getMeasurement` function to get a single measurement based on a id. Only measurements for the currently authenticated user can be requested.

```typescript
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate({
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

await sdk.authenticate({
  token: '',
  tokenSecret: '',
});

// Returns the first 20 measurements
const measurements = await sdk.getMeasurements();

// Returns the next 20 measurements
const nextMeasurements = await measurements.next();
```

## Request a measurement report and render the PDF

The `sdk.getMeasurementReportUrl` accepts a `measurementId` and will handle creation / fetching of the report. This function works great in combination with `react-native-pdf` or `react-native-share`

* First time calling this function for a measurement, it will take a little longer as the cloud service will render the report. Once it's ready (\~5s) the url where you can fetch it will be returned
* Subsequent calls will be much faster, as the report is already rendered and the url will be returned almost instantly.
* The pdf will always be rendered in the language of the user (this language is specified during [#register-a-new-user](examples.md#register-a-new-user "mention"))

```typescript
import client from '@fibricheck/javascript-sdk';
import Pdf from 'react-native-pdf';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate({
  token: '',
  tokenSecret: '',
});

const measurementId = '0000';

const App = () => {
  const [uri, setUri] = useState();

  useEffect(() => {
    (async () => {
      const uri = await sdk.getReportUrl(measurementId);
      setUri(uri);
    })();
  }, []);

  return (
    <Pdf
      source={{
        uri,
      }}
    />
  );
};  
```

## Request all periodic reports

The `sdk.getPeriodicReports` method will retrieve all your periodic reports.

* This method is a [generator function](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/function\*) that returns an [iterator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators\_and\_Generators). This iterator can be called with `.next()` to retrieve the next 20 reports. Another way to do this, is by using the for await construction (as seen in the example)  &#x20;
* In the periodic reports, the `trigger` field indicates for which period the report was made (7 days, 30 days or at the end of a prescription)

**⚠️** To use this functionality, `@babel/plugin-proposal-async-generator-functions` is required. This plugin is included in `@babel/preset-env`.

```typescript
import client from '@fibricheck/javascript-sdk';

interface PeriodicReport {
  id: string;
  status: string;
  trigger: 'PERIOD_DAYS_PASSED_7' | 'PERIOD_DAYS_PASSED_30' | 'PRESCRIPTION_ENDED'; 
  creationTimestamp: number;
}

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate({
  token: '',
  tokenSecret: '',
});

const reportsIterator = await sdk.getPeriodicReports();

for await (const reportsPage of reportsIterator) {
  ... /* PagedResult<PeriodReport> */
}
```

## Request a periodic report in PDF-format

The `sdk.getPeriodicReportPdf` method will retrieve a pdf-version of the periodic report.

* This method takes the `reportId` as a parameter.
* The pdf will always be rendered in the language of the user (this language is specified during [#register-a-new-user](examples.md#register-a-new-user "mention"))

Here's an example of how to convert the response to a pdf using [react-native-share](https://github.com/react-native-share/react-native-share):

```typescript
import client from '@fibricheck/javascript-sdk';
import Share from 'react-native-share';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate({
  token: '',
  tokenSecret: '',
});

const report = await sdk.getPeriodicReportPdf('62441ce00000000000000000');
const base64 = Buffer.from(file.data, 'binary').toString('base64');
const file = `data:application/pdf;base64,${base64}`;
const filename = file.headers['content-disposition'].split('filename="')[1].split('.pdf"')[0];

await Share.open({
  title: filename,
  type: 'application/pdf',
  filename: filename,
  url: file,
});
```

## Activating a prescription

The `sdk.activatePrescription` method will link the prescription to the user and activate it.\
This method takes the prescription's`hash` as a parameter.

```tsx
import client from '@fibricheck/javascript-sdk';

const sdk = client({
  consumerKey: '',
  consumerSecret: '',
});

await sdk.authenticate({
  token: '',
  tokenSecret: '',
});

await sdk.activatePrescription('1234567890');
```
