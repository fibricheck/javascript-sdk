import { documentKey } from './types/configuration';

export const HOST = 'api.dev.fibricheck.com';

export const SCHEMA_NAMES = {
  FIBRICHECK_MEASUREMENTS: 'fibricheck-measurements',
  MEASUREMENT_REPORTS: 'measurement-reports',
} as const;

export const REQUIRED_DOCUMENTS: documentKey[] = ['privacyPolicy', 'termsOfUse'];
