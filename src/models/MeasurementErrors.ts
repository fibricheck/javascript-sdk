import { FCError } from './FCError';

export class NoActivePrescriptionError extends FCError {
  constructor(message?: string) {
    super('NoActivePrescription', message || 'An active prescription is necessary to take a measurement');
  }
}
