/* eslint-disable max-classes-per-file */
import { FCError } from './FCError';

export class NotPaidError extends FCError {
  constructor(message?: string) {
    super('NotPaid', message || 'This prescription needs to be paid before it can be activated');
  }
}

export class AlreadyActivatedError extends FCError {
  constructor(message?: string) {
    super('AlreadyActivated', message || 'A prescription can only be activated once');
  }
}
