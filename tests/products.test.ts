import { createApiClient } from '../src/client/ApiClient';
import { assertJsonHeaders, assertResponseTime } from '../src/utils/assertions';

describe('Products API', () => {
  const apiClient = createApiClient();

  describe('GET /products', () => {
    it('should return paginated product list', async () => {
      const res = await apiClient.get('/products?limit=5&skip=0');

      expect(res.status).toBe(200);
      assertJsonHeaders(res.headers);
      expect(res.body.products).toHaveLength(5);
      expect(res.body.total).toBeGreaterThan(0);
      expect(res.body.skip).toBe(0);
      expect(res.body.limit).toBe(5);
    });

    it('should return different products with pagination', async () => {
      const [p1, p2] = await Promise.all([
        apiClient.get('/products?limit=5&skip=0'),
        apiClient.get('/products?limit=5&skip=5'),
      ]);

      const ids1 = p1.body.products.map((p: { id: number }) => p.id);
      const ids2 = p2.body.products.map((p: { id: number }) => p.id);
      const overlap = ids1.filter((id: number) => ids2.includes(id));
      expect(overlap).toHaveLength(0);
    });

    it('should sort products by price ascending', async () => {
      const res = await apiClient.get('/products?sortBy=price&order=asc&limit=10');

      expect(res.status).toBe(200);
      const prices = res.body.products.map((p: { price: number }) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    });
  });

  describe('GET /products/:id', () => {
    it('should return product with all required fields', async () => {
      const res = await apiClient.get('/products/1');

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(1);
      expect(res.body.title).toBeTruthy();
      expect(res.body.description).toBeTruthy();
      expect(res.body.price).toBeGreaterThan(0);
      expect(res.body.category).toBeTruthy();
      expect(res.body.thumbnail).toMatch(/^https?:\/\//);
      expect(res.body.images).toBeInstanceOf(Array);
      expect(res.body.rating).toBeDefined();
      expect(res.body.stock).toBeDefined();
    });

    it('should return 404 for non-existent product', async () => {
      const res = await apiClient.get('/products/999999');

      expect(res.status).toBe(404);
      expect(res.body.message).toBeTruthy();
    });

    it.each([1, 2, 3, 5, 10])('should return product %i within SLO', async (id) => {
      const start = Date.now();
      const res = await apiClient.get(`/products/${id}`);

      expect(res.status).toBe(200);
      assertResponseTime(start, 1500);
    });
  });

  describe('GET /products/categories', () => {
    it('should return list of product categories', async () => {
      const res = await apiClient.get('/products/categories');

      expect(res.status).toBe(200);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBeGreaterThan(0);
    });
  });

  describe('GET /products/category/:name', () => {
    it('should return products filtered by category', async () => {
      // First get categories
      const catRes = await apiClient.get('/products/categories');
      const firstCat = catRes.body[0];
      const slug = typeof firstCat === 'string' ? firstCat : firstCat.slug;

      const res = await apiClient.get(`/products/category/${slug}`);

      expect(res.status).toBe(200);
      expect(res.body.products).toBeDefined();
      expect(res.body.products.length).toBeGreaterThan(0);
    });
  });

  describe('POST /products/add', () => {
    it('should add a new product', async () => {
      const newProduct = {
        title: 'Test Product',
        description: 'A test product for API testing',
        price: 29.99,
        category: 'test',
      };

      const res = await apiClient.post('/products/add', newProduct);

      expect(res.status).toBe(201);
      expect(res.body.id).toBeGreaterThan(0);
      expect(res.body.title).toBe(newProduct.title);
      expect(res.body.price).toBe(newProduct.price);
    });
  });

  describe('PUT /products/:id', () => {
    it('should update product title', async () => {
      const res = await apiClient.put('/products/1', { title: 'Updated Product' });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe('Updated Product');
    });
  });

  describe('DELETE /products/:id', () => {
    it('should delete product and return deleted data', async () => {
      const res = await apiClient.delete('/products/1');

      expect(res.status).toBe(200);
      expect(res.body.isDeleted).toBe(true);
      expect(res.body.deletedOn).toBeTruthy();
    });
  });
});
