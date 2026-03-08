import { createApiClient } from '../src/client/ApiClient';
import {
  UserListResponseSchema,
  UserSchema,
  CreateUserResponseSchema,
  UpdateUserResponseSchema,
} from '../src/schemas/user.schema';
import { TEST_CREDENTIALS, NEW_USER, VALID_USER_IDS } from '../src/data/testData';
import { assertSchema, assertJsonHeaders } from '../src/utils/assertions';

describe('Users API', () => {
  const apiClient = createApiClient();

  beforeAll(async () => {
    const res = await apiClient.post('/auth/login', TEST_CREDENTIALS.valid);
    apiClient.withToken(res.body.accessToken);
  });

  afterAll(() => {
    apiClient.clearToken();
  });

  describe('GET /users', () => {
    it('should return paginated user list with correct structure', async () => {
      const res = await apiClient.get('/users?limit=5&skip=0');

      expect(res.status).toBe(200);
      assertJsonHeaders(res.headers);
      assertSchema(UserListResponseSchema, res.body);
    });

    it('should respect limit parameter', async () => {
      const res = await apiClient.get('/users?limit=5');

      expect(res.body.users).toHaveLength(5);
      expect(res.body.limit).toBe(5);
    });

    it('should include pagination metadata', async () => {
      const res = await apiClient.get('/users');

      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.skip).toBeDefined();
      expect(res.body.limit).toBeDefined();
    });

    it('should return different users with skip parameter', async () => {
      const [p1, p2] = await Promise.all([
        apiClient.get('/users?limit=5&skip=0'),
        apiClient.get('/users?limit=5&skip=5'),
      ]);

      const ids1 = p1.body.users.map((u: { id: number }) => u.id);
      const ids2 = p2.body.users.map((u: { id: number }) => u.id);
      expect(ids1).not.toEqual(expect.arrayContaining(ids2));
    });
  });

  describe('GET /users/:id', () => {
    it.each(VALID_USER_IDS)('should return user %i with valid schema', async (id) => {
      const res = await apiClient.get(`/users/${id}`);

      expect(res.status).toBe(200);
      assertSchema(UserSchema, res.body);
      expect(res.body.id).toBe(id);
    });

    it('should return 404 for non-existent user', async () => {
      const res = await apiClient.get('/users/999999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBeTruthy();
    });

    it('should return user with all required fields', async () => {
      const res = await apiClient.get('/users/1');
      const user = res.body;

      expect(user.id).toBeDefined();
      expect(user.firstName).toBeTruthy();
      expect(user.lastName).toBeTruthy();
      expect(user.email).toMatch(/@/);
      expect(user.image).toMatch(/^https?:\/\//);
    });
  });

  describe('POST /users/add', () => {
    it('should create user and return 201 with assigned id', async () => {
      const res = await apiClient.post('/users/add', NEW_USER);

      expect(res.status).toBe(201);
      assertSchema(CreateUserResponseSchema, res.body);
      expect(res.body.firstName).toBe(NEW_USER.firstName);
      expect(res.body.lastName).toBe(NEW_USER.lastName);
      expect(res.body.id).toBeDefined();
    });
  });

  describe('PUT /users/:id', () => {
    it('should update user and return updated fields', async () => {
      const res = await apiClient.put('/users/1', { lastName: 'Updated' });

      expect(res.status).toBe(200);
      expect(res.body.lastName).toBe('Updated');
      assertSchema(UpdateUserResponseSchema, res.body);
    });
  });

  describe('PATCH /users/:id', () => {
    it('should partially update user', async () => {
      const res = await apiClient.patch('/users/1', { firstName: 'Patched' });

      expect(res.status).toBe(200);
      expect(res.body.firstName).toBe('Patched');
    });
  });

  describe('DELETE /users/:id', () => {
    it('should delete user and return 200 with isDeleted flag', async () => {
      const res = await apiClient.delete('/users/100');

      expect(res.status).toBe(200);
      expect(res.body.isDeleted).toBe(true);
      expect(res.body.deletedOn).toBeTruthy();
    });
  });
});
