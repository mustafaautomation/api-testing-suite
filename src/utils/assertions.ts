import { ZodSchema } from 'zod';

/**
 * Validates a response body against a Zod schema.
 * Logs schema errors on failure for easy debugging.
 */
export function assertSchema<T>(schema: ZodSchema<T>, body: unknown): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  [${i.path.join('.')}] ${i.message}`)
      .join('\n');
    throw new Error(`Schema validation failed:\n${issues}`);
  }
  return result.data;
}

/**
 * Asserts a response completed within an acceptable duration (ms).
 */
export function assertResponseTime(startTime: number, maxMs: number = 500): void {
  const duration = Date.now() - startTime;
  if (duration > maxMs) {
    throw new Error(`Response time ${duration}ms exceeded threshold of ${maxMs}ms`);
  }
}

/**
 * Asserts standard JSON API headers are present.
 */
export function assertJsonHeaders(headers: Record<string, string>): void {
  expect(headers['content-type']).toMatch(/application\/json/);
}
