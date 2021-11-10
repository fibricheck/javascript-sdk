import {
  UserData,
  RegisterUserData,
  ParamsOauth1WithEmail,
  ParamsOauth1WithToken,
  PagedResult,
  TokenDataOauth1,
} from '@extrahorizon/javascript-sdk';

import { Measurement, MeasurementCreationData } from './types/measurement';

export type UserRegisterData = RegisterUserData;

export type LegalDocumentKey = 'privacyPolicy' | 'termsOfUse';

export interface Consent {
  key: LegalDocumentKey;
  version: string;
  url: string;
}

export interface FibricheckSDK {
  register: (data: UserRegisterData) => Promise<UserData>;
  authenticate: (
    credentials: ParamsOauth1WithEmail | ParamsOauth1WithToken,
    onConsentNeeded: (data: Consent[]) => void
  ) => Promise<TokenDataOauth1>;

  giveConsent: (data: Omit<Consent, 'url'>) => void;

  postMeasurement: (measurement: MeasurementCreationData) => Promise<Measurement>;
  getMeasurement: (measurementId: string) => Promise<Measurement>;
  getMeasurements: () => Promise<PagedResult<Measurement>>;

  getReportUrl: (measurementId: string) => Promise<string>;
}
