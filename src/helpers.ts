import { BadRequestError } from '@extrahorizon/javascript-sdk';
import * as R from 'ramda';
import { LABEL_SEVERITY } from './constants';
import { MeasurementDiagnosis, Measurement } from './types/measurement';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function retryUntil<T>(interval = 2000, tries = 5, func: { (): Promise<any>; }, condition: { (arg0: any): boolean; }): Promise<T> {
  if (tries === 0) {
    throw Error('timeout');
  }

  const result = await func();
  if (condition(result)) {
    return result;
  }
  await delay(interval);
  return retryUntil(interval, tries - 1, func, condition);
}

/**
 * Retries the function if it fails with the specified error
 * @param interval
 * @param tries
 * @param func
 * @param errorToCompare
 * @returns {Promise<T>}
 */
export async function retryForError<T>(
  interval = 2000,
  tries = 5,
  func: () => Promise<T>,
  errorToCompare: typeof BadRequestError
): Promise<T> {
  try {
    const result = await func();
    return result;
  } catch (error) {
    // ? Last try, throw error
    if (tries === 1) {
      throw error;
    }

    if (error instanceof errorToCompare) {
      await delay(interval);
      return retryForError(interval, tries - 1, func, errorToCompare);
    }

    throw error;
  }
}

export const sortAndLastFn = R.pipe<
  MeasurementDiagnosis[],
  MeasurementDiagnosis[],
  MeasurementDiagnosis
>(
  R.sortBy((val: MeasurementDiagnosis) => R.indexOf(val, LABEL_SEVERITY)),
  R.last
);

/**
 * Use this function to determine the most severe label under the diagnosis.
 * @param measurement
 * @returns MeasurementDiagnosis
 */
export const getMostSevereLabel = (measurement: Measurement) => {
  const { diagnosis } = measurement.data ?? {};

  if (!diagnosis) {
    return '';
  }

  return sortAndLastFn(diagnosis.label || []);
};
