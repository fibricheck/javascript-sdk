import { documentKey } from './types/configuration';
import { MeasurementDiagnosis } from './types/measurement';

export const DEV_HOST = 'api.dev.fibricheck.com';
export const PRODUCTION_HOST = 'api.fibricheck.com';

export const SCHEMA_NAMES = {
  FIBRICHECK_MEASUREMENTS: 'fibricheck-measurements',
  MEASUREMENT_REPORTS: 'measurement-reports',
} as const;

export const API_SERVICES = {
  PRESCRIPTIONS: '/prescriptions/v1',
  FILES: '/files/v1',
  REPORTS: '/reports/v1',
  GROUPS: '/groups/v1',
};

// These are sorted from least severe to most severe
export const LABEL_SEVERITY: MeasurementDiagnosis[] = [
  // These exist in the schema but are no longer used
  // 'sinus_arrhythmia',
  // 'undiagnosable',
  // 'extrasystoles',
  // 'tachy_arrhytmia',
  // 'brady_arrhytmia',

  'no_diagnosis',
  'phone_incompatible',
  'quality_to_low',
  'pacemaker_rhythm',
  'sinus',
  'increased_hrv',
  'extrasystoles_isolated',
  'extrasystoles_frequent',
  'extrasystoles_trig_episode',
  'extrasystoles_big_episode',
  'extrasystoles_trigeminy',
  'extrasystoles_bigminy',
  'bradycardia',
  'tachycardia',
  'other',
  'dubious_rhythm',
  'brady_episode',
  'tachy_episode',
  'atrial_flutter',
  'atrial_fibrillation',
];

export const REQUIRED_DOCUMENTS: documentKey[] = ['privacyPolicy', 'termsOfUse'];
