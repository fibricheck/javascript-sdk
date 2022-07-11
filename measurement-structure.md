---
description: >-
  The complete structure is exported as a type: `Measurement` in the SDK. For
  completeness, we will explain some parts more in detail here.
---

# Measurement Structure

## Creating a measurement

### CameraData

This snippet shows the interface that is implemented when performing a measurement via the `react-native-camera-sdk`. This way, you don't have to worry about populating these fields.

```typescript
interface CameraData {
  acc?: MotionData;
  rotation?: MotionData;
  grav?: MotionData;
  gyro?: MotionData;
  heartrate: number;
  measurement_timestamp: number;
  quadrants: Yuv[][];
  technical_details: {
    camera_exposure_time: number;
    camera_hardware_level: string;
    camera_iso: number;
  };
  time: number[];
  yList: number[];
  abnormalities?: Abnormalities[];
  attempts?: number;
  skippedPulseDetection: boolean;
  skippedFingerDetection: boolean;
  skippedMovementDetection: boolean;
}
```

This structure can be used for creating `MeasurementCreationData,` which can be posted to our backend via the `sdk.postMeasurement()`

### Context

When a measurement has been performed, context can be added. This context can contain one activity and multiple symptoms.&#x20;

```typescript
interface MeasurementContext {
  symptoms:
  | 'no_symptoms'
  | 'lightheaded'
  | 'confused'
  | 'fatigue'
  | 'other'
  | 'palpitations'
  | 'chest_pains'
  | 'shortness_of_breath'[];
  activity:
  | 'resting'
  | 'sleeping'
  | 'sitting'
  | 'walking'
  | 'working'
  | 'exercising'
  | 'other'
  | 'standing';
  symptomSeverity?:
  | '2a'
  | '2b'
  | '3'
  | '4';
}
```

These symptoms can be directly added to a measurement or can be updated at a later stage by using `sdk.updateMeasurementContext`. This can be beneficial to the user experience. If you send the raw measurement data first, the processing of the measurement can already take place on the backend. When the user has selected their symptoms, it can then be added to the already processed measurement.

## Displaying a measurement

### Indicator

This value represents the indicator that the FibriCheck algorithm has given to the measurement. When the `status` is `reviewed`, it means this indicator is validated by a medical professional. Possible values are `'normal' | 'quality' | 'urgent' | 'warning'`

### Status

A measurement can have multiple statuses, depending in which phase of the review process it is currently in:

|                          |                                                                                                                                                                                                                                                                     |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| measured                 | The measurement is received. The value of viewResult is being determined. The status should change to preprocessing\_selection immediately.                                                                                                                         |
| preprocessing\_selection | The value of algoPreprocessing is being determined. The status should change to analysis\_selection immediately.                                                                                                                                                    |
| analysis\_selection      | The value of algoAnalysis is being determined. The status should change to pending\_analysis immediately.                                                                                                                                                           |
| pending\_analysis        | The measurement is waiting for the algorithm to analyze it. The Algo Queue Manager will transition the measurement to under\_analysis if the algorithm is ready to analyze                                                                                          |
| under\_analysis          | The measurement is being analyzed by the measurement. The Algo Queue Manager will transition the measurement to analysis\_failed or processing\_results depending on the response of the algorithm.                                                                 |
| analysis\_failed         | The algorithm was not able to analyze this measurement. The measurement will stay in this status until manually transitioned back to pending\_analysis.                                                                                                             |
| processing\_results      | The result of the analysis is being processed by the process-measurement-result-task. The task will transition the measurement to the analyzed status.                                                                                                              |
| analyzed                 | The measurement was successfully analyzed. Depending on the value of autoPendingReview, set by the task in the previous step, the measurement will immediately transition to pending\_review or stay in this status until manually transitioned to pending\_review. |
| pending\_review          | The measurement is awaiting revision by a human medical expert. The human revision is currently meant to be completed within 48 hours and will transition the status to                                                                                             |
| reviewed                 | The measurement is reviewed by a human medical expert. The measurement will stay in this status until manually transitioned to pending\_review.                                                                                                                     |

### Diagnosis

A measurement can have multiple diagnoses, to get the most severe diagnosis, you can use the `getMostSevereLabel` function. Possible values of this diagnose are:&#x20;

```
  'sinus_arrhythmia'
  'extrasystoles_trig_episode'
  'undiagnosable'
  'extrasystoles_isolated'
  'dubious_rhythm'
  'extrasystoles'
  'extrasystoles_trigeminy'
  'tachy_episode'
  'extrasystoles_frequent'
  'phone_incompatible'
  'extrasystoles_big_episode'
  'increased_hrv'
  'sinus'
  'atrial_flutter'
  'brady_episode'
  'tachycardia'
  'extrasystoles_bigminy'
  'tachy_arrhytmia'
  'pacemaker_rhythm'
  'bradycardia'
  'brady_arrhytmia'
  'quality_to_low'
  'atrial_fibrillation'
  'other' 
  'no_diagnosis'
```

### Heart rate

The algorithm also returns the calculated heartrate under `heartrate` property

### Measurement timestamp

The date and time of the measurement is given in epoch format under the `measurement_timestamp` property.

