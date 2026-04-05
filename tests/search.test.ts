import { createApiClient } from '../src/client/ApiClient';
import { assertJsonHeaders } from '../src/utils/assertions';

describe('Search & Filter API', () => {
  const apiClient = createApiClient();

  describe('GET /users/search', () => {
    it('should return users matching search query', async () => {
      const res = await apiClient.get('/users/search?q=John');

      expect(res.status).toBe(200);
      assertJsonHeaders(res.headers);
      expect(res.body.users).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(0);
    });

    it('should return empty results for non-matching query', async () => {
      const res = await apiClient.get('/users/search?q=zzzznonexistent999');

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(0);
      expect(res.body.total).toBe(0);
    });

    it('should respect limit in search results', async () => {
      const res = await apiClient.get('/users/search?q=a&limit=3');

      expect(res.status).toBe(200);
      expect(res.body.users.length).toBeLessThanOrEqual(3);
    });
  });

  describe('GET /users/filter', () => {
    it('should filter users by key-value', async () => {
      const res = await apiClient.get('/users/filter?key=hair.color&value=Brown');

      expect(res.status).toBe(200);
      expect(res.body.users).toBeDefined();
      expect(res.body.total).toBeGreaterThan(0);
    });
  });

  describe('GET /users/sort', () => {
    it('should return users sorted by firstName ascending', async () => {
      const res = await apiClient.get('/users?sortBy=firstName&order=asc&limit=5');

      expect(res.status).toBe(200);
      const names = res.body.users.map((u: { firstName: string }) => u.firstName);
      const sorted = [...names].sort();
      expect(names).toEqual(sorted);
    });

    it('should return users sorted by age descending', async () => {
      const res = await apiClient.get('/users?sortBy=age&order=desc&limit=10');

      expect(res.status).toBe(200);
      const ages = res.body.users.map((u: { age: number }) => u.age);
      for (let i = 1; i < ages.length; i++) {
        expect(ages[i]).toBeLessThanOrEqual(ages[i - 1]);
      }
    });
  });

  describe('GET /products/search', () => {
    it('should search products by query', async () => {
      const res = await apiClient.get('/products/search?q=phone');

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.total).toBeGreaterThanOrEqual(0);
    });

    it('should return products with correct structure', async () => {
      const res = await apiClient.get('/products/search?q=laptop');

      expect(res.status).toBe(200);
      if (res.body.products.length > 0) {
        const product = res.body.products[0];
        expect(product.id).toBeDefined();
        expect(product.title).toBeDefined();
        expect(product.price).toBeDefined();
        expect(product.category).toBeDefined();
      }
    });
  });
});
