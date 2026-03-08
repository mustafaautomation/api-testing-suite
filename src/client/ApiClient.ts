import request, { Test, Response } from 'supertest';
import { ENV } from '../config/env';

type Body = Record<string, unknown>;

interface RetryOptions {
  attempts: number;
  baseDelay: number;
}

const DEFAULT_RETRY: RetryOptions = { attempts: 3, baseDelay: 500 };

/**
 * Thin wrapper around SuperTest providing a clean, chainable API client.
 * Handles auth headers, base URL, content-type, retry logic, and request logging.
 */
export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private retryOpts: RetryOptions | null = null;
  private logging = false;

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

  enableRetry(opts?: Partial<RetryOptions>): this {
    this.retryOpts = { ...DEFAULT_RETRY, ...opts };
    return this;
  }

  disableRetry(): this {
    this.retryOpts = null;
    return this;
  }

  enableLogging(): this {
    this.logging = true;
    return this;
  }

  disableLogging(): this {
    this.logging = false;
    return this;
  }

  async get(path: string): Promise<Response> {
    return this.executeWithRetry(
      () => {
        const req = request(this.baseURL).get(path).set('Content-Type', 'application/json');
        if (this.token) req.set('Authorization', `Bearer ${this.token}`);
        return req;
      },
      'GET',
      path,
    );
  }

  async post(path: string, body?: Body): Promise<Response> {
    return this.executeWithRetry(
      () => {
        const req = request(this.baseURL)
          .post(path)
          .set('Content-Type', 'application/json')
          .send(body);
        if (this.token) req.set('Authorization', `Bearer ${this.token}`);
        return req;
      },
      'POST',
      path,
    );
  }

  async put(path: string, body?: Body): Promise<Response> {
    return this.executeWithRetry(
      () => {
        const req = request(this.baseURL)
          .put(path)
          .set('Content-Type', 'application/json')
          .send(body);
        if (this.token) req.set('Authorization', `Bearer ${this.token}`);
        return req;
      },
      'PUT',
      path,
    );
  }

  async patch(path: string, body?: Body): Promise<Response> {
    return this.executeWithRetry(
      () => {
        const req = request(this.baseURL)
          .patch(path)
          .set('Content-Type', 'application/json')
          .send(body);
        if (this.token) req.set('Authorization', `Bearer ${this.token}`);
        return req;
      },
      'PATCH',
      path,
    );
  }

  async delete(path: string): Promise<Response> {
    return this.executeWithRetry(
      () => {
        const req = request(this.baseURL).delete(path).set('Content-Type', 'application/json');
        if (this.token) req.set('Authorization', `Bearer ${this.token}`);
        return req;
      },
      'DELETE',
      path,
    );
  }

  private async executeWithRetry(
    makeRequest: () => Test,
    method: string,
    path: string,
  ): Promise<Response> {
    const maxAttempts = this.retryOpts?.attempts ?? 1;
    const baseDelay = this.retryOpts?.baseDelay ?? 500;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const start = Date.now();
        const res = await makeRequest();
        const duration = Date.now() - start;

        if (this.logging) {
          console.error(`[API] ${method} ${path} → ${res.status} (${duration}ms)`);
        }

        // Don't retry on 4xx — those are expected in tests
        if (res.status >= 500 && attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          if (this.logging) {
            console.error(
              `[API] Retry ${attempt}/${maxAttempts} after ${delay}ms (status ${res.status})`,
            );
          }
          await new Promise((r) => setTimeout(r, delay));
          continue;
        }

        return res;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        if (attempt < maxAttempts) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          if (this.logging) {
            console.error(
              `[API] Retry ${attempt}/${maxAttempts} after ${delay}ms (${lastError.message})`,
            );
          }
          await new Promise((r) => setTimeout(r, delay));
        }
      }
    }

    throw lastError ?? new Error(`Request failed after ${maxAttempts} attempts`);
  }
}

export function createApiClient(baseURL?: string): ApiClient {
  return new ApiClient(baseURL);
}
