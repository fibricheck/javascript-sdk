import client from '../../src';
import { mockClientParams } from '../__helpers__/authentication';

describe('sdk client', () => {
  it('should create an http client', async () => {
    const sdk = client(mockClientParams);
    expect(sdk).toBeDefined();
  });
});
