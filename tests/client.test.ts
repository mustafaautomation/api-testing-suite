import { createApiClient } from '../src/client/ApiClient';

describe('ApiClient', () => {
  const client = createApiClient();

  it('should create client with default base URL', () => {
    expect(client).toBeDefined();
  });

  it('should support method chaining', () => {
    const result = client.withToken('test').enableRetry().enableLogging();
    expect(result).toBe(client);
  });

  it('should clear token', () => {
    client.withToken('test');
    const result = client.clearToken();
    expect(result).toBe(client);
  });
});
