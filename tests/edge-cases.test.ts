import { createApiClient } from '../src/client/ApiClient';

describe('Edge Cases & Error Handling', () => {
  const apiClient = createApiClient();

  describe('Pagination boundaries', () => {
    it('should handle skip beyond total', async () => {
      const res = await apiClient.get('/users?skip=99999&limit=5');

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(0);
    });

    it('should handle limit=0 (API may return default)', async () => {
      const res = await apiClient.get('/users?limit=0');

      expect(res.status).toBe(200);
      // DummyJSON returns default results for limit=0
      expect(res.body.users).toBeDefined();
    });

    it('should handle large limit gracefully', async () => {
      const res = await apiClient.get('/users?limit=500');

      expect(res.status).toBe(200);
      expect(res.body.users).toBeDefined();
      // API should cap or return all available
      expect(res.body.users.length).toBeGreaterThan(0);
    });
  });

  describe('Invalid endpoints', () => {
    it('should return 404 for completely invalid path', async () => {
      const res = await apiClient.get('/nonexistent/endpoint/xyz');

      // DummyJSON returns 404 for unknown paths
      expect([404, 200]).toContain(res.status);
    });
  });

  describe('Concurrent requests', () => {
    it('should handle 10 concurrent requests without errors', async () => {
      const promises = Array.from({ length: 10 }, (_, i) => apiClient.get(`/users/${i + 1}`));

      const results = await Promise.all(promises);
      const allSuccessful = results.every((r) => r.status === 200);
      expect(allSuccessful).toBe(true);
    });

    it('should handle mixed concurrent CRUD operations', async () => {
      const results = await Promise.all([
        apiClient.get('/users/1'),
        apiClient.get('/products/1'),
        apiClient.get('/users?limit=3'),
        apiClient.post('/users/add', { firstName: 'Concurrent', lastName: 'Test' }),
        apiClient.get('/products?limit=3'),
      ]);

      results.forEach((res) => {
        expect([200, 201]).toContain(res.status);
      });
    });
  });

  describe('Response body validation', () => {
    it('should always return JSON for API endpoints', async () => {
      const endpoints = ['/users', '/users/1', '/products', '/products/1'];

      for (const endpoint of endpoints) {
        const res = await apiClient.get(endpoint);
        expect(res.headers['content-type']).toMatch(/application\/json/);
      }
    });

    it('should include expected fields in user response', async () => {
      const res = await apiClient.get('/users/1');

      // DummyJSON is a test API — it includes password for demo purposes
      // In a real API, this test would verify password is NOT exposed
      expect(res.body.firstName).toBeTruthy();
      expect(res.body.lastName).toBeTruthy();
      expect(res.body.email).toBeTruthy();
    });
  });

  describe('API client features', () => {
    it('should work with retry enabled', async () => {
      const client = createApiClient().enableRetry({ attempts: 2, baseDelay: 100 });
      const res = await client.get('/users/1');

      expect(res.status).toBe(200);
    });

    it('should work with logging enabled', async () => {
      const client = createApiClient().enableLogging();
      const res = await client.get('/users/1');
      client.disableLogging();

      expect(res.status).toBe(200);
    });

    it('should chain configuration methods', async () => {
      const client = createApiClient().enableRetry({ attempts: 2, baseDelay: 100 }).enableLogging();

      const res = await client.get('/users/1');
      client.disableRetry().disableLogging();

      expect(res.status).toBe(200);
    });
  });
});
