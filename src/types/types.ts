import {
  UserData,
  RegisterUserData,
  ParamsOauth1WithEmail,
  ParamsOauth1WithToken,
  Document,
  PagedResult,
  TokenDataOauth1,
} from '@extrahorizon/javascript-sdk';

import { CameraData } from '@fibricheck/react-native-camera-sdk';

import {
  AlgoAnalysis,
  MeasurementContext,
  Indicator,
  MeasurementDiagnosis,
  MeasurementStatus,
  ReviewType,
} from './measurement/types';
import { Report } from './report/types';

type UserRegisterData = RegisterUserData;

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

type MeasurementCreationData = InputData & {
  context?: MeasurementContext;
}

type MeasurementResponseData = MeasurementCreationData & {
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
  creationTimestamp: Date;
};

export type LegalDocumentKey = 'privacyPolicy' | 'termsOfUse';

export interface Consent {
  key: LegalDocumentKey;
  version: string;
  url: string;
}

export interface FibricheckSDK {
  // registration and auth
  register: (data: UserRegisterData) => Promise<UserData>;
  getAuthorizationLink: () => string;
  authorize: () => void;
  authenticate: (
    credentials: ParamsOauth1WithEmail | ParamsOauth1WithToken,
    onConsentNeeded: () => Consent[]
  ) => Promise<TokenDataOauth1>;

  giveConsent: (data: Omit<Consent, 'url'>) => void;

  postMeasurement: (measurement: MeasurementCreationData) => Promise<Measurement>;
  getMeasurement: (measurementId: string) => Promise<Measurement>;
  getMeasurements: () => Promise<PagedResult<Measurement>>;

  generateReport: (
    measurementId: string,
    onReportReady: () => Report
  ) => Promise<Report>;
}
