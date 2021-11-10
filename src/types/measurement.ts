import { Document } from '@extrahorizon/javascript-sdk';
import { CameraData } from '@fibricheck/react-native-camera-sdk';

export type MeasurementStatus =
  /*
   * The measurement is received.
   * The value of viewResult is being determined.
   * The status should change to preprocessing_selection immediately.
   */
  | 'measured'
  /*
   * The value of algoPreprocessing is being determined.
   * The status should change to analysis_selection immediately.
   */
  | 'preprocessing_selection'
  /*
   * The value of algoAnalysis is being determined.
   * The status should change to pending_analysis immediately.
   */
  | 'analysis_selection'
  /*
   * The measurement is waiting for the algorithm to analyze it.
   * The Algo Queue Manager will transition the measurement to under_analysis if the algorithm is ready to analyze the measurement.
   */
  | 'pending_analysis'
  /*
   * The measurement is being analyzed by the measurement.
   * The Algo Queue Manager will transition the measurement to analysis_failed or processing_results depending on the response of the algorithm.
   */
  | 'under_analysis'
  /*
   * The algorithm was not able to analyze this measurement.
   *The measurement will stay in this status until manually transitioned back to pending_analysis.
   */
  | 'analysis_failed'
  /*
   * The result of the analysis is being processed by the process-measurement-result-task.
   * The task will transition the measurement to the analyzed status.
   */
  | 'processing_results'
  /*
   * The measurement was successfully analyzed.
   * Depending on the value of autoPendingReview, set by the task in the previous step,
   * the measurement will immediately transition to pending_review or stay in this status until manually transitioned to pending_review.
   */
  | 'analyzed'
  /*
   * The measurement is awaiting revision by a human medical expert.
   * The human revision is currently meant to be completed within 48 hours and will transition the status to reviewed.
   */
  | 'pending_review'
  /*
   * The measurement is reviewed by a human medical expert.
   * The measurement will stay in this status until manually transitioned to pending_review.
   */
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
  symptoms: 'no_symptoms' | 'lightheaded' | 'confused' | 'fatigue' | 'other' | 'palpitations' | 'chest_pains' | 'shortness_of_breath'[];
  activity: 'resting' | 'sleeping' | 'sitting' | 'walking' | 'working' | 'exercising' | 'other' | 'standing';
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
}

type InputData = CameraData & {
  signals?: Record<string, { time: number[]; data: number[]; }>;
}

export type MeasurementCreationData = InputData & {
  context?: MeasurementContext;
}

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
}

export type Measurement = Document<MeasurementResponseData> & {
  status: MeasurementStatus;
};
