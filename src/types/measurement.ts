/* eslint-disable max-len */
import { Document } from '@extrahorizon/javascript-sdk';

/**
*
* value | &nbsp;&nbsp;&nbsp;&nbsp; | description
* - | - | -
* _**measured**_ |  | The measurement is received. The value of viewResult is being determined. The status should change to preprocessing_selection immediately.
*  |  |
* _**preprocessing\_selection**_ |  | The value of algoPreprocessing is being determined. The status should change to analysis_selection immediately.
*  |  |
* _**analysis\_selection**_ | | The value of algoAnalysis is being determined. The status should change to pending_analysis immediately.
*  |  |
* _**pending\_analysis**_ | | The measurement is waiting for the algorithm to analyze it. The Algo Queue Manager will transition the measurement to under_analysis if the algorithm is ready to analyze the measurement.
*  |  |
* _**under\_analysis**_ | | The measurement is being analyzed by the measurement. The Algo Queue Manager will transition the measurement to analysis_failed or processing_results depending on the response of the algorithm.
*  |  |
* _**analysis\_failed**_ | | The algorithm was not able to analyze this measurement. The measurement will stay in this status until manually transitioned back to pending_analysis.
*  |  |
* _**processing\_results**_ | | The result of the analysis is being processed by the process-measurement-result-task. The task will transition the measurement to the analyzed status.
*  |  |
* _**analyzed**_ | | The measurement was successfully analyzed. Depending on the value of autoPendingReview, set by the task in the previous step, the measurement will immediately transition to pending_review or stay in this status until manually transitioned to pending_review.
*  |  |
* _**pending\_review**_ | | The measurement is awaiting revision by a human medical expert. The human revision is currently meant to be completed within 48 hours and will transition the status to reviewed.
*  |  |
* _**reviewed**_ | | The measurement is reviewed by a human medical expert. The measurement will stay in this status until manually transitioned to pending_review.
*/
export type MeasurementStatus =
  | 'measured'
  | 'preprocessing_selection'
  | 'analysis_selection'
  | 'pending_analysis'
  | 'under_analysis'
  | 'analysis_failed'
  | 'processing_results'
  | 'analyzed'
  | 'pending_review'
  | 'reviewed';

export type MeasurementDiagnosis =
  | 'sinus_arrhythmia'
  | 'extrasystoles_trig_episode'
  | 'other'
  | 'undiagnosable'
  | 'extrasystoles_isolated'
  | 'dubious_rhythm'
  | 'extrasystoles'
  | 'extrasystoles_trigeminy'
  | 'tachy_episode'
  | 'extrasystoles_frequent'
  | 'phone_incompatible'
  | 'extrasystoles_big_episode'
  | 'increased_hrv'
  | 'sinus'
  | 'atrial_flutter'
  | 'brady_episode'
  | 'tachycardia'
  | 'extrasystoles_bigminy'
  | 'tachy_arrhytmia'
  | 'pacemaker_rhythm'
  | 'bradycardia'
  | 'brady_arrhytmia'
  | 'quality_to_low'
  | 'atrial_fibrillation'
  | 'no_diagnosis';

export type Indicator = 'normal' | 'quality' | 'urgent' | 'warning';

export type AlgoAnalysis =
  | 'premium'
  | 'essential'
  | 'semi_continuous'
  | 'semicontinuous';

export type ReviewType = 'automatic';

export interface MeasurementContext {
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

interface Device {
  manufacturer?: string;
  model?: string;
  os?: string;
  type?: 'android' | 'ios';
}

interface App {
  name: string;
  version: string;
  build?: number;
  branch?: string;
  camera_sdk_version?: string;
  fibricheck_sdk_version?: string;
}

/* eslint-disable camelcase */
interface MotionData {
  x: number[];
  y: number[];
  z: number[];
}

interface Yuv {
  u: number[];
  v: number[];
  y: number[];
}

type Abnormalities =
  | 'inverted'
  | 'bad_signal_quality'
  | 'pulse_not_found'
  | 'saturated_rgb'
  | 'quality_flag'
  | 'finger_not_found';

export interface CameraData {
  acc?: MotionData;
  rotation?: MotionData;
  grav?: MotionData;
  gyro?: MotionData;
  heartrate: number;
  measurement_timestamp: number;
  quadrants: Yuv[][];
  technicalDetails: {
    camera_exposure_time: number;
    camera_hardware_level: string;
    camera_iso: number;
  };
  time: number[];
  yList: number[];
  abnormalities?: Abnormalities[];
  attempts?: number;
}

export type MeasurementCreationData = CameraData & {
  signals?: Record<string, { time: number[]; data: number[]; }>;
  context?: MeasurementContext;
};

export type MeasurementResponseData = MeasurementCreationData & {
  app: App;
  device: Device;
  location?: {
    latitude: number;
    longitude: number;
  };
  diagnosis?: {
    text: string;
    label: MeasurementDiagnosis[];
  };
  af?: number;
  indicator?: Indicator;
  algoAnalysis?: AlgoAnalysis;
  review_type?: ReviewType;
  tags: string[];
};

export type Measurement = Document<MeasurementResponseData> & {
  status: MeasurementStatus;
};
