/**
 * Offline checks that the Zod schemas and assertion helpers actually reject
 * bad data. The live tests only prove that good responses pass; these prove
 * that a broken response would fail. No network calls.
 */
import { UserSchema, UserListResponseSchema } from '../src/schemas/user.schema';
import { LoginResponseSchema } from '../src/schemas/auth.schema';
import { assertSchema, assertJsonHeaders, assertResponseTime } from '../src/utils/assertions';

const validUser = {
  id: 1,
  firstName: 'Emily',
  lastName: 'Johnson',
  email: 'emily.johnson@x.dummyjson.com',
  username: 'emilys',
  image: 'https://dummyjson.com/icon/emilys/128',
};

describe('Schema negative checks (offline)', () => {
  it('accepts a valid user', () => {
    expect(assertSchema(UserSchema, validUser)).toEqual(validUser);
  });

  it.each([
    ['missing email', { ...validUser, email: undefined }, 'email'],
    ['malformed email', { ...validUser, email: 'not-an-email' }, 'email'],
    ['non-URL image', { ...validUser, image: 'avatar.png' }, 'image'],
    ['id as string', { ...validUser, id: '1' }, 'id'],
    ['zero id', { ...validUser, id: 0 }, 'id'],
    ['empty firstName', { ...validUser, firstName: '' }, 'firstName'],
  ])('rejects a user with %s and names the field', (_label, body, field) => {
    expect(() => assertSchema(UserSchema, body)).toThrow(`[${field}]`);
  });

  it('reports the array index of a bad item in a user list', () => {
    const body = {
      users: [validUser, { ...validUser, email: 'bad' }],
      total: 2,
      skip: 0,
      limit: 30,
    };
    expect(() => assertSchema(UserListResponseSchema, body)).toThrow('[users.1.email]');
  });

  it('rejects a login response without tokens', () => {
    const result = LoginResponseSchema.safeParse({ ...validUser, gender: 'female' });
    expect(result.success).toBe(false);
  });
});

describe('Assertion helpers (offline)', () => {
  it('accepts JSON content types with a charset', () => {
    expect(() =>
      assertJsonHeaders({ 'content-type': 'application/json; charset=utf-8' }),
    ).not.toThrow();
  });

  it('rejects a non-JSON content type', () => {
    expect(() => assertJsonHeaders({ 'content-type': 'text/html' })).toThrow(
      'Expected JSON content-type',
    );
  });

  it('fails when the response time exceeds the threshold', () => {
    expect(() => assertResponseTime(Date.now() - 1000, 500)).toThrow('exceeded threshold of 500ms');
  });

  it('passes when the response time is under the threshold', () => {
    expect(() => assertResponseTime(Date.now(), 500)).not.toThrow();
  });
});
