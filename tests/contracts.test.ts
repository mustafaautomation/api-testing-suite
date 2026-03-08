/**
 * CONTRACT TESTS
 * Verify the API honours its contract — correct schemas, headers, and response time SLOs.
 * These tests catch breaking changes between API versions.
 */
import { createApiClient } from '../src/client/ApiClient';
import { UserListResponseSchema, UserSchema } from '../src/schemas/user.schema';
import { LoginResponseSchema } from '../src/schemas/auth.schema';
import { TEST_CREDENTIALS, NEW_USER } from '../src/data/testData';
import { assertSchema, assertResponseTime } from '../src/utils/assertions';

const SLO_MS = 1000;

describe('Contract Tests', () => {
  const apiClient = createApiClient();

  describe('Response headers', () => {
    it('GET /users — responds with JSON content-type', async () => {
      const res = await apiClient.get('/users');
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('POST /auth/login — responds with JSON content-type', async () => {
      const res = await apiClient.post('/auth/login', TEST_CREDENTIALS.valid);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });

    it('POST /users/add — responds with JSON content-type', async () => {
      const res = await apiClient.post('/users/add', NEW_USER);
      expect(res.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Response schemas', () => {
    it('GET /users — body matches UserListResponse schema', async () => {
      const res = await apiClient.get('/users?limit=5');
      assertSchema(UserListResponseSchema, res.body);
    });

    it('GET /users/:id — body matches User schema', async () => {
      const res = await apiClient.get('/users/2');
      assertSchema(UserSchema, res.body);
    });

    it('POST /auth/login — body matches LoginResponse schema', async () => {
      const res = await apiClient.post('/auth/login', TEST_CREDENTIALS.valid);
      assertSchema(LoginResponseSchema, res.body);
    });
  });

  describe('Response time SLOs', () => {
    it(`GET /users — responds within ${SLO_MS}ms`, async () => {
      const start = Date.now();
      await apiClient.get('/users');
      assertResponseTime(start, SLO_MS);
    });

    it(`GET /users/:id — responds within ${SLO_MS}ms`, async () => {
      const start = Date.now();
      await apiClient.get('/users/2');
      assertResponseTime(start, SLO_MS);
    });

    it(`POST /auth/login — responds within ${SLO_MS}ms`, async () => {
      const start = Date.now();
      await apiClient.post('/auth/login', TEST_CREDENTIALS.valid);
      assertResponseTime(start, SLO_MS);
    });
  });

  describe('HTTP status codes', () => {
    it('GET  /users        → 200', async () =>
      expect((await apiClient.get('/users')).status).toBe(200));
    it('GET  /users/2      → 200', async () =>
      expect((await apiClient.get('/users/2')).status).toBe(200));
    it('GET  /users/999999 → 404', async () =>
      expect((await apiClient.get('/users/999999')).status).toBe(404));
    it('POST /users/add    → 201', async () =>
      expect((await apiClient.post('/users/add', NEW_USER)).status).toBe(201));
    it('PUT  /users/2      → 200', async () =>
      expect((await apiClient.put('/users/2', { firstName: 'x' })).status).toBe(200));
    it('DEL  /users/2      → 200', async () =>
      expect((await apiClient.delete('/users/2')).status).toBe(200));
  });
});
