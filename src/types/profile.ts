export interface ProfileData {
  birthday?: string;
  gender?: Gender;
  fibricheck_info?: {
    app: {
      version: string;
    };
    device: {
      os: string;
      model: string;
      type: string;
      manufacturer: string;
    };
  };
}

export enum Gender {
  NotKnown = 0,
  Male = 1,
  Female = 2,
  NotApplicable = 9
}
