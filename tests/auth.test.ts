import { createApiClient } from '../src/client/ApiClient';
import { LoginResponseSchema } from '../src/schemas/auth.schema';
import { TEST_CREDENTIALS } from '../src/data/testData';
import { assertSchema, assertResponseTime, assertJsonHeaders } from '../src/utils/assertions';

describe('Authentication API', () => {
  const apiClient = createApiClient();

  describe('POST /auth/login', () => {
    it('should return tokens and user info for valid credentials', async () => {
      const start = Date.now();
      const res = await apiClient.post('/auth/login', TEST_CREDENTIALS.valid);

      expect(res.status).toBe(200);
      assertJsonHeaders(res.headers);
      assertResponseTime(start, 2000);
      assertSchema(LoginResponseSchema, res.body);
      expect(res.body.accessToken).toBeTruthy();
      expect(res.body.refreshToken).toBeTruthy();
    });

    it('should return 400 for invalid password', async () => {
      const res = await apiClient.post('/auth/login', TEST_CREDENTIALS.invalidPassword);

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTruthy();
    });

    it('should return 400 for non-existent username', async () => {
      const res = await apiClient.post('/auth/login', TEST_CREDENTIALS.invalidUsername);

      expect(res.status).toBe(400);
      expect(res.body.message).toBeTruthy();
    });

    it('should return 400 when body is empty', async () => {
      const res = await apiClient.post('/auth/login', {});

      expect(res.status).toBe(400);
    });
  });
});
