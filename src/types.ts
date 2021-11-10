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
  /**
   * Create an account
   *
   * @param requestBody UserRegisterData
   * @returns User
   * @throws {EmailUsedError}
   */
  register: (data: UserRegisterData) => Promise<UserData>;
  /**
   * Use token authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   * @see https://docs.fibricheck.com/examples#legal-documents-updated
   * @example
   * await sdk.auth.authenticate({
   *   token: '',
   *   tokenSecret: '',
   * });
   * @throws {ApplicationNotAuthenticatedError}
   * @throws {AuthenticationError}
   * @throws {LoginTimeoutError}
   * @throws {LoginFreezeError}
   * @throws {TooManyFailedAttemptsError}
   * @throws {MfaRequiredError}
   */
  authenticate(credentials: ParamsOauth1WithToken,
    onConsentNeeded: (data: Consent[]) => void
  ): Promise<TokenDataOauth1>;
  /**
   * Use password authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   * @see https://docs.fibricheck.com/examples#legal-documents-updated
   * @example
   * await sdk.auth.authenticate({
   *   email: '',
   *   password: '',
   * });
   * @throws {ApplicationNotAuthenticatedError}
   * @throws {AuthenticationError}
   * @throws {LoginTimeoutError}
   * @throws {LoginFreezeError}
   * @throws {TooManyFailedAttemptsError}
   * @throws {MfaRequiredError}
   */
  authenticate(credentials: ParamsOauth1WithEmail,
    onConsentNeeded: (data: Consent[]) => void
  ): Promise<TokenDataOauth1>;
  /**
   * Return documents received from the `onConsentNeeded` callback on authentication after the user has approved them.
   */
  giveConsent: (data: Omit<Consent, 'url'>) => void;
  /**
   * Send a measurement to the cloud.
   * @see https://docs.fibricheck.com/examples#react-component-to-make-a-measurement
   * @params {MeasurementCreationData} measurementData
   * @returns {Promise<Measurement>} measurement
   */
  postMeasurement: (measurement: MeasurementCreationData) => Promise<Measurement>;
  /**
   * Gets a measurement by measurementId
   * @param {string} measurementId
   * @returns {Promise<Measurement>} measurement
   */
  getMeasurement: (measurementId: string) => Promise<Measurement>;
  /**
   * Gets all measurements for the current user
   * @returns {Promise<PagedResult<Measurement>>} measurements
   */
  getMeasurements: () => Promise<PagedResult<Measurement>>;
  /**
   * Returns an url that can be used to render or download the report as PDF.
   * @see TODO -> pdf example
   * @returns {string} url
   */
  getReportUrl: (measurementId: string) => Promise<string>;
}
