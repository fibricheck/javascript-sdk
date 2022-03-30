export declare type ObjectId = string;

export enum PRESCRIPTION_STATUS {
  FREE = 'FREE',
  NOT_PAID = 'NOT_PAID',
  PAID_BY_USER = 'PAID_BY_USER',
  PAID_BY_GROUP = 'PAID_BY_GROUP',
  EXPIRED = 'EXPIRED',
  ACTIVATED = 'ACTIVATED',
};

export interface Prescription {
  creationTimestamp: Date;
  creatorId: ObjectId;
  duration: number;
  groupId: ObjectId;
  hash: string;
  id: ObjectId;
  logs: {
    newStatus: keyof typeof PRESCRIPTION_STATUS;
    oldStatus: keyof typeof PRESCRIPTION_STATUS;
    timestamp: Date;
  }[];
  packageId: ObjectId;
  paidTimestamp: Date;
  price: number;
  reference: string;
  status: keyof typeof PRESCRIPTION_STATUS;
  templateId: ObjectId;
  updateTimestamp: Date;
  userId: ObjectId;
};