import { documentKey } from './types/configuration';

export const DEV_HOST = 'api.dev.fibricheck.com';
export const PRODUCTION_HOST = 'api.fibricheck.com';

export const SCHEMA_NAMES = {
  FIBRICHECK_MEASUREMENTS: 'fibricheck-measurements',
  MEASUREMENT_REPORTS: 'measurement-reports',
} as const;

export const REQUIRED_DOCUMENTS: documentKey[] = ['privacyPolicy', 'termsOfUse'];
