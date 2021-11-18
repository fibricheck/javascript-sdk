import * as R from 'ramda';
import { LABEL_SEVERITY } from './constants';
import { Measurement, MeasurementDiagnosis } from './types/measurement';

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
export const getMostSeverelabel = (measurement: Measurement) => {
  const { diagnosis } = measurement.data ?? {};

  if (!diagnosis) {
    return '';
  }

  return sortAndLastFn(diagnosis.label || []);
};
