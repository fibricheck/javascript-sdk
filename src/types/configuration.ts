export interface Document {
  version: string;
  url: string;
}

export interface Documents {
  privacyPolicy: Document;
  termsOfUse: Document;
}

export interface GeneralConfiguration {
  documents: Documents;
}

export type documentKey = keyof Documents;

export interface UserConfiguration {
  documents: Record<documentKey, Record<string, Date>>;
}
