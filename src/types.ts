import {
  UserData,
  RegisterUserData,
  ParamsOauth1WithEmail,
  ParamsOauth1WithToken,
  PagedResult,
  TokenDataOauth1,
  AffectedRecords,
  ParamsOauth2Password,
  ParamsOauth2Refresh,
  TokenDataOauth2,
} from '@extrahorizon/javascript-sdk';

import { Measurement, MeasurementContext, MeasurementCreationData } from './types/measurement';
import { ProfileData } from './types/profile';
import { PeriodicReport } from './types/report';

export type UserRegisterData = RegisterUserData;
export type LegalDocumentKey = 'privacyPolicy' | 'termsOfUse';

export type FindAllIterator<T> = AsyncGenerator<
  PagedResult<T>,
  Record<string, never>,
  void
>;

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
   * Use OAuth1 token authentication.
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
    onConsentNeeded?: (data: Consent[]) => void
  ): Promise<TokenDataOauth1|TokenDataOauth2>;
  /**
   * Use OAuth1 password authentication.
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
    onConsentNeeded?: (data: Consent[]) => void
  ): Promise<TokenDataOauth1|TokenDataOauth2>;
  /**
   * Use OAuth2 password authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   * @see https://docs.fibricheck.com/examples#legal-documents-updated
   * @example
   * await sdk.auth.authenticate({
   *   username: '',
   *   password: '',
   * });
   * @throws {ApplicationNotAuthenticatedError}
   * @throws {AuthenticationError}
   * @throws {LoginTimeoutError}
   * @throws {LoginFreezeError}
   * @throws {TooManyFailedAttemptsError}
   * @throws {MfaRequiredError}
   */
  authenticate(credentials: ParamsOauth2Password,
    onConsentNeeded?: (data: Consent[]) => void
  ): Promise<TokenDataOauth1|TokenDataOauth2>;
  /**
   * Use OAuth2 refreshtoken authentication.
   * As second parameter you need to pass in callback function that is fired when the user needs to sign updated legal documents
   * @see https://docs.fibricheck.com/examples#legal-documents-updated
   * @example
   * await sdk.auth.authenticate({
   *   refreshToken: ''
   * });
   * @throws {ApplicationNotAuthenticatedError}
   * @throws {AuthenticationError}
   * @throws {LoginTimeoutError}
   * @throws {LoginFreezeError}
   * @throws {TooManyFailedAttemptsError}
   * @throws {MfaRequiredError}
   */
  authenticate(credentials: ParamsOauth2Refresh,
    onConsentNeeded?: (data: Consent[]) => void
  ): Promise<TokenDataOauth1|TokenDataOauth2>;
  /**
   *  Logout
   *  @returns {boolean} Success
   *  @example
   *  await sdk.authenticate({
   *    password: '',
   *    username: '',
   *  });
   *  sdk.auth.logout();
   */
  logout: () => boolean;
  /**
   * Return documents received from the `onConsentNeeded` callback on authentication after the user has approved them.
   * @params {Omit<Consent, 'url'>} data
   * @returns AffectedRecords
   */
  giveConsent: (data: Omit<Consent, 'url'>) => Promise<AffectedRecords>;
  /**
   * Send a measurement to the cloud.
   * @see https://docs.fibricheck.com/examples#react-component-to-make-a-measurement
   * @params {MeasurementCreationData} measurementData
   * @throws {NoActivePrescriptionError}
   * @returns {Promise<Measurement>} measurement
   */
  postMeasurement: (measurement: MeasurementCreationData, cameraSdkVersion?: string) => Promise<Measurement>;
  /**
   * Check if the user is entitled to perform a measurement
   * @returns {Promise<boolean>} measurement
   */
  canPerformMeasurement: () => Promise<boolean>;
  /**
   * Add context to an existing measurement
   * @param {string} measurementId
   * @params {MeasurementContext} measurementContext
   * @throws {LockedDocumentError}
   * @returns AffectedRecords
   */
  updateMeasurementContext: (measurementId: string, measurementContext: MeasurementContext) => Promise<AffectedRecords>;
  /**
   * Update the user profile
   * @params {ProfileData} profileData
   * @returns AffectedRecords
   */
  updateProfile: (profileData: ProfileData) => Promise<AffectedRecords>;
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
   * @see https://docs.fibricheck.com/examples#requesting-a-measurement-report-and-rendering-pdf
   * @returns {string} url
   */
  getMeasurementReportUrl: (measurementId: string) => Promise<string>;
  /**
   * Gets a list of periodic reports
   * @returns {FindAllIterator<PeriodicReport>} periodicReports
   */
  getPeriodicReports: () => Promise<FindAllIterator<PeriodicReport>>;
  /**
   * Get the pdf of a periodic report
   * @returns {pdf} pdf
   */
  getPeriodicReportPdf: (reportId: string) => Promise<ArrayBuffer>;
  /**
   * Activates a prescription hash, so the user can perform a measurement
   * @throws {NotPaidError}
   * @throws {AlreadyActivatedError}
   */
  activatePrescription: (hash: string) => Promise<void>;
}
