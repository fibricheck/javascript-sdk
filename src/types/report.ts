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
  trigger: string;
  creationTimestamp: number;
  // TODO Check casing
}

export const REPORT_STATUS = {
  rendered: 'rendered',
  COMPLETE: 'COMPLETE',
};