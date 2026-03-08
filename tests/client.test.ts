import { createApiClient, ApiClient } from '../src/client/ApiClient';

describe('ApiClient', () => {
  it('should create client via factory', () => {
    const client = createApiClient();
    expect(client).toBeInstanceOf(ApiClient);
  });

  it('should support method chaining for all config methods', () => {
    const client = createApiClient();
    const result = client
      .withToken('test')
      .enableRetry()
      .enableLogging()
      .disableRetry()
      .disableLogging()
      .clearToken();
    expect(result).toBe(client);
  });

  it('should create client with custom base URL', () => {
    const client = createApiClient('https://custom-api.example.com');
    expect(client).toBeInstanceOf(ApiClient);
  });

  describe('retry behavior', () => {
    it('should succeed on first attempt for healthy endpoints', async () => {
      const client = createApiClient().enableRetry({ attempts: 3, baseDelay: 100 });
      const res = await client.get('/users?limit=1');
      expect(res.status).toBe(200);
    });

    it('should not retry on 4xx errors', async () => {
      const client = createApiClient().enableRetry({ attempts: 3, baseDelay: 100 });
      const start = Date.now();
      const res = await client.get('/users/999999');
      const duration = Date.now() - start;
      expect(res.status).toBe(404);
      // Should not have waited for retries (3 * 100ms base = 700ms+ if retried)
      expect(duration).toBeLessThan(2000);
    });
  });

  describe('logging', () => {
    it('should log requests to stderr when enabled', async () => {
      const client = createApiClient().enableLogging();
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await client.get('/users?limit=1');
      expect(spy).toHaveBeenCalledWith(expect.stringContaining('[API] GET /users?limit=1'));
      spy.mockRestore();
    });

    it('should not log when logging is disabled', async () => {
      const client = createApiClient().disableLogging();
      const spy = jest.spyOn(console, 'error').mockImplementation();
      await client.get('/users?limit=1');
      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });
  });
});
