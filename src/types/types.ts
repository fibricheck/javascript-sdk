import {
  UserData,
  RegisterUserData,
  ParamsOauth1WithEmail,
  ParamsOauth1WithToken,
  Document,
  PagedResult,
  TokenDataOauth1,
} from '@extrahorizon/javascript-sdk';

import { 
  Abnormalities,
  AlgoAnalysis,
  Context,
  Indicator,
  MeasurementDiagnosis,
  MeasurementStatus,
  MotionData,
  ReviewType,
  Yuv
} from './measurement/types'
import { Report } from './report/types';

interface CreateMeasurementData {
  data: string;
  context: Context
}

export interface MeasurementData {
  abnormalities?: Abnormalities[];
  app: {
    name: string;
    version: string;
  };
  context:Context;
  device: {
    manufacturer?: string;
    model?: string;
    os?:string;
    type?: 'android' | 'ios' | '???';
  },
  heartrate?: number;

  location: {
    latitude: number;
    longitude: number;
  },
  measurement_timestamp: Date;
  diagnosis?: {
    text: string;
    label: MeasurementDiagnosis[];
  };
  af?: number;
  indicator?: Indicator;
  algoAnalysis?: AlgoAnalysis;
  review_type?: ReviewType;
  

  acc: MotionData;
  rotation: MotionData;
  grav: MotionData;
  gyro: MotionData;
  time: number[];
  attempts: number;
  standardDeviationY: number[];
  quadrants: Yuv[][]
}

export type Measurement = Document<MeasurementData> & {
  status: MeasurementStatus;
  creationTimestamp: Date;  
  // With Notes / Comments / Report?
};


export interface LegalDocument {
  version: string;
  url: string;
}

export type LegalDocuments = {
  privacyPolicy: LegalDocument;
  termsOfUse: LegalDocument;
};

export type LegalDocumentKey = keyof LegalDocuments;

export type Consent = { key: LegalDocumentKey, version: LegalDocument }

export interface FibricheckSDK {
  // registration and auth
  register: (data: RegisterUserData) => Promise<UserData>;
  getAuthorizationLink: () => string;
  authorize: () => void;
  authenticate: (
    credentials: ParamsOauth1WithEmail | ParamsOauth1WithToken,
  ) => Promise<TokenDataOauth1>;

  // consent or do we return this with authenticate? 
  onConsentNeeded: () => Consent[];
  giveConsent: (data:{ key: LegalDocumentKey }) => void;

  // handling measurements
  postMeasurement(measurement: CreateMeasurementData): () => Promise<Measurement>;

  // iets van pageing hierbij? of get by id?
  getMeasurements: () => Promise<PagedResult<Measurement>>;

  // reports
  generateReport: (measurementId: string) => Promise<Report>;
  onReportReady: () => Report;
}
