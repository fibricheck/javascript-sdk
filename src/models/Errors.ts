// eslint-disable-next-line max-classes-per-file
export class FCError extends Error {
  constructor(name: string, message: string) {
    super(name);
    this.message = message;
  }
}

export class PrescriptionError extends FCError {}
export class MeasurementError extends FCError {}
