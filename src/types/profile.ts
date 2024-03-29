export declare type ObjectId = string;

export interface ProfileData {
  addressLine1?: string;
  addressLine2?: string;
  country?: string;
  region?: string;
  city?: string;
  postalCode?: string;
  birthday?: string;
  /**
   * See ISO 5218
   */
  gender?: Gender;
  fibricheckInfo?: {
    app?: {
      version?: string;
      build?: string;
      branch?: string;
    };
    device?: {
      os?: string;
      model?: string;
      type?: 'android' | 'ios';
      manufacturer?: string;
    };
  };
  length?: number;
  weight?: number;
  afHistory?: boolean;
  comorbidities?: Array<Comorbidities>;
  physician?: string;
  smoker?: boolean;
  activity?: ProfileActivity;
  impediments?: Array<Impediments>;
  medication?: Array<Medication>;
  groups?: Array<Group>;
  customFields?: Record<string, string>;
  creationTimestamp?: Date;
  updateTimestamp?: Date;
}

export enum Gender {
  NotKnown = 0,
  Male = 1,
  Female = 2,
  NotApplicable = 9
}

export enum ProfileActivity {
  NOT_ACTIVE = 'NOT_ACTIVE',
  SLIGHTLY_ACTIVE = 'SLIGHTLY_ACTIVE',
  MODERATELY_ACTIVE = 'MODERATELY_ACTIVE',
  ACTIVE = 'ACTIVE',
  VERY_ACTIVE = 'VERY_ACTIVE',
}

export enum Comorbidities {
  HEART_FAILURE = 'HEART_FAILURE',
  DIABETES = 'DIABETES',
  COPD = 'COPD',
  HYPERTENSION = 'HYPERTENSION',
  VASCULAR_DISEASE = 'VASCULAR_DISEASE',
  HISTORY_OF_TIA_STROKE = 'HISTORY_OF_TIA_STROKE',
}

export enum Impediments {
  TREMOR = 'TREMOR',
  PERNIOSIS = 'PERNIOSIS',
  CALLUS = 'CALLUS',
}

export interface Medication {
  name: string;
  dosis: {
    number?: number;
    unit?: MedicationUnit;
  };
  medicationFrequency?: MedicationFrequency;
  count: number;
}

export enum MedicationUnit {
  MG = 'mg',
  ML = 'ml',
  PILL = 'pill',
}

export enum MedicationFrequency {
  AS_NEEDED = 'AS_NEEDED',
  EVERY_DAY = 'EVERY_DAY',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH',
  BIRTH_CONTROL = 'BIRTH_CONTROL',
}

export interface Group {
  groupId?: string;
  reason?: string;
  /**
   * This serves as a field to link a patient to the medical record of a hospital/physician.
   * This field therefor accepts any string, not just an ObjectId.
   *
   */
  patientId?: string;
  customFields?: Record<string, string>;
}
