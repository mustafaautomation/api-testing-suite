# API Testing Suite

[![API Tests](https://github.com/mustafaautomation/api-testing-suite/actions/workflows/api-tests.yml/badge.svg)](https://github.com/mustafaautomation/api-testing-suite/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg?logo=docker&logoColor=white)](Dockerfile)

Production-grade REST API testing suite built with SuperTest, Jest, and Zod schema validation. Targets the [DummyJSON](https://dummyjson.com) API as a reference implementation.

---

## Table of Contents

- [Why?](#why)
- [Demo](#demo)
- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [Stack](#stack)
- [Test Coverage](#test-coverage)
- [Key Patterns](#key-patterns)
- [CI/CD Integration](#cicd-integration)
- [Project Structure](#project-structure)
- [Development](#development)

---

## Why?

API testing requires more than just status code checks. This suite demonstrates:

- **Schema validation** via Zod — catch contract breaks before they hit production
- **Contract tests** — headers, schemas, and response time SLOs in one suite
- **Data-driven tests** — `it.each` for parameterized scenarios
- **Full CRUD coverage** — GET, POST, PUT, PATCH, DELETE
- **Auth flow** — token extraction and reuse across test suites
- **Reusable assertion helpers** with descriptive error messages

---

## Demo

```
$ npm test

 PASS  tests/auth.test.ts (4 tests)
 PASS  tests/users.test.ts (15 tests)
 PASS  tests/contracts.test.ts (15 tests)
 PASS  tests/client.test.ts (7 tests)

Test Suites: 4 passed, 4 total
Tests:       41 passed, 41 total
Time:        8.5s
```

> **41 tests** covering auth, CRUD, contracts, schemas, headers, SLOs, and client unit tests.

---

## Quick Start

```bash
git clone https://github.com/mustafaautomation/api-testing-suite.git
cd api-testing-suite
npm install
cp .env.example .env

# Run all tests
npm test

# Run specific suite
npm run test:auth
npm run test:users
npm run test:contracts

# With coverage
npm run test:coverage
```

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Test Suites                        │
│ auth │ users │ contracts │ client (unit)        │
├─────────────────────────────────────────────────────┤
│                   Shared Layer                       │
│   ApiClient │ Assertions │ Schemas │ Test Data       │
├─────────────────────────────────────────────────────┤
│                  SuperTest + Zod                     │
│              HTTP assertions + schema validation     │
├─────────────────────────────────────────────────────┤
│                  Target API                          │
│              DummyJSON (https://dummyjson.com)       │
└─────────────────────────────────────────────────────┘
```

---

## Stack

| Tool | Purpose |
|---|---|
| [SuperTest](https://github.com/ladjs/supertest) | HTTP assertions |
| [Jest](https://jestjs.io) | Test runner + HTML/JUnit reporters |
| [Zod](https://zod.dev) | Schema validation |
| [TypeScript](https://typescriptlang.org) | Type safety |
| GitHub Actions | CI pipeline with nightly schedule |
| [DummyJSON](https://dummyjson.com) | Target REST API |

---

## Test Coverage

| Suite | Tests | What it covers |
|---|---|---|
| `auth.test.ts` | 4 | Login, error states, missing fields |
| `users.test.ts` | 15 | CRUD, pagination, data-driven, 404 handling |
| `contracts.test.ts` | 15 | Schemas, headers, SLOs, status codes |
| `client.test.ts` | 7 | ApiClient factory, chaining, retry, logging |
| **Total** | **41** | |

---

## Key Patterns

### Schema Validation with Zod

```typescript
const UserSchema = z.object({
  id:        z.number().positive(),
  firstName: z.string().min(1),
  email:     z.string().email(),
  image:     z.string().url(),
});

assertSchema(UserSchema, res.body); // throws with descriptive error on failure
```

### Data-Driven Tests

```typescript
it.each(VALID_USER_IDS)('should return user %i', async (id) => {
  const res = await apiClient.get(`/users/${id}`);
  expect(res.status).toBe(200);
});
```

### Factory Pattern with `createApiClient()`

```typescript
const apiClient = createApiClient(); // each test suite gets its own isolated client
apiClient.withToken(token).enableRetry().enableLogging();
```

### Retry with Exponential Backoff

```typescript
const client = createApiClient().enableRetry({ attempts: 3, baseDelay: 500 });
// Retries on 5xx and network errors; never retries 4xx (expected in tests)
```

### Request Logging

```typescript
const client = createApiClient().enableLogging();
// Logs to stderr: [API] GET /users → 200 (142ms)
```

### Response Time SLOs

```typescript
const start = Date.now();
await apiClient.get('/users');
assertResponseTime(start, 500); // fails if > 500ms
```

---

## CI/CD Integration

The GitHub Actions workflow:

1. Runs lint, format, type check on every push/PR
2. Executes all 41 tests
3. Uploads HTML + JUnit reports as artifacts
4. Nightly scheduled run at 1 AM UTC

Set credentials as repository secrets:
- `TEST_PASSWORD`

---

## Project Structure

```
api-testing-suite/
├── .github/
│   ├── workflows/api-tests.yml   # CI pipeline with nightly schedule
│   ├── dependabot.yml            # Automated dependency updates
│   ├── CODEOWNERS                # Review ownership
│   └── pull_request_template.md  # PR checklist
├── src/
│   ├── client/
│   │   └── ApiClient.ts          # Reusable HTTP client with auth
│   ├── config/
│   │   └── env.ts                # Centralized environment config
│   ├── schemas/
│   │   ├── user.schema.ts        # Zod schemas for user endpoints
│   │   └── auth.schema.ts        # Zod schemas for auth endpoints
│   ├── data/
│   │   └── testData.ts           # Test credentials and payloads
│   └── utils/
│       └── assertions.ts         # Schema, SLO, header assertions
├── tests/
│   ├── auth.test.ts              # Login, register, error handling
│   ├── users.test.ts             # Full CRUD + data-driven tests
│   ├── contracts.test.ts         # Schema, headers, SLO validation
│   └── client.test.ts            # ApiClient unit tests
├── CONTRIBUTING.md
├── SECURITY.md
├── Dockerfile
└── .dockerignore
```

---

## Development

```bash
git clone https://github.com/mustafaautomation/api-testing-suite.git
cd api-testing-suite
npm install
cp .env.example .env
npm test              # Run all API tests
npm run test:ci       # Run tests in CI mode (--runInBand --forceExit)
npm run typecheck     # Type checking
npm run lint          # ESLint
npm run format:check  # Prettier
```

---

## License

MIT

---

Built by [Quvantic](https://quvantic.com)
