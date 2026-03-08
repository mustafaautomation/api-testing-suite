import request, { Test } from 'supertest';
import { ENV } from '../config/env';

type Body = Record<string, unknown>;

/**
 * Thin wrapper around SuperTest providing a clean, chainable API client.
 * Handles auth headers, base URL, and content-type consistently.
 */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = ENV.BASE_URL) {
    this.baseURL = baseURL;
  }

  withToken(token: string): this {
    this.token = token;
    return this;
  }

  clearToken(): this {
    this.token = null;
    return this;
  }

  get(path: string): Test {
    const req = request(this.baseURL).get(path).set('Content-Type', 'application/json');
    if (this.token) req.set('Authorization', `Bearer ${this.token}`);
    return req;
  }

  post(path: string, body?: Body): Test {
    const req = request(this.baseURL).post(path).set('Content-Type', 'application/json').send(body);
    if (this.token) req.set('Authorization', `Bearer ${this.token}`);
    return req;
  }

  put(path: string, body?: Body): Test {
    const req = request(this.baseURL).put(path).set('Content-Type', 'application/json').send(body);
    if (this.token) req.set('Authorization', `Bearer ${this.token}`);
    return req;
  }

  patch(path: string, body?: Body): Test {
    const req = request(this.baseURL)
      .patch(path)
      .set('Content-Type', 'application/json')
      .send(body);
    if (this.token) req.set('Authorization', `Bearer ${this.token}`);
    return req;
  }

  delete(path: string): Test {
    const req = request(this.baseURL).delete(path).set('Content-Type', 'application/json');
    if (this.token) req.set('Authorization', `Bearer ${this.token}`);
    return req;
  }
}

export const apiClient = new ApiClient();
