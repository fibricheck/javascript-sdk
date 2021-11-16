import { Document } from '@extrahorizon/javascript-sdk';

export interface ReportDocumentData {
  measurementId: string;
  language: string;
  readFileToken?: string;
  forMeasurementUpdatedTimestamp:number;
}

export type ReportDocumentStatus = 'requested' | 'rendering' |'rendered';

export type ReportDocument = Document<ReportDocumentData> & {
  status: ReportDocumentStatus;
  creationTimestamp: Date;
};
