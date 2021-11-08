export interface Report {
  id: string;
  creationTimestamp: Date;
  language: string;
  trigger:
  | 'PRESCRIPTION_ENDED'
  | 'PERIOD_DAYS_PASSED_30'
  | 'PERIOD_DAYS_PASSED_7'
  | 'MANUAL';
  file?: string;
  filename?: string;
}
