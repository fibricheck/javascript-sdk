import { getMockSdk } from '@extrahorizon/javascript-sdk';

export const mockSdk = getMockSdk<jest.Mock>(jest.fn);
export const createClient = () => mockSdk;
export const createOAuth1Client = () => mockSdk;

export default {
  ...jest.requireActual('@extrahorizon/javascript-sdk'),
};
module.exports = {
  ...jest.requireActual('@extrahorizon/javascript-sdk'),
  createOAuth1Client,
  mockSdk,
};
