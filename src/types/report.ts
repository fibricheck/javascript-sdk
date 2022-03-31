import { Document } from '@extrahorizon/javascript-sdk';

export interface ReportDocumentData {
  measurementId: string;
  language?: string;
  readFileToken?: string;
  forMeasurementUpdatedTimestamp?: number;
}

export type ReportDocumentStatus = 'requested' | 'rendering' |'rendered';

export type ReportDocument = Document<ReportDocumentData> & {
  status: ReportDocumentStatus;
  creationTimestamp: Date;
};

export interface PeriodicReport {
  id: string;
  status: string;
  trigger: 'PERIOD_DAYS_PASSED_7' | 'PERIOD_DAYS_PASSED_30' | 'PRESCRIPTION_ENDED';
  creationTimestamp: number;
}

export const REPORT_STATUS = {
  rendered: 'rendered',
  COMPLETE: 'COMPLETE',
};
