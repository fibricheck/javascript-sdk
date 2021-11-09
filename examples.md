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
