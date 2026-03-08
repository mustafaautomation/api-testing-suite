# api-testing-suite

> Production-grade REST API testing suite built with SuperTest + Jest + Zod schema validation.

[![API Tests](https://github.com/mustafaautomation/api-testing-suite/actions/workflows/api-tests.yml/badge.svg)](https://github.com/mustafaautomation/api-testing-suite/actions/workflows/api-tests.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/mustafaautomation/api-testing-suite/blob/main/LICENSE)
[![Jest](https://img.shields.io/badge/tested_with-Jest-99424f.svg)](https://jestjs.io)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6.svg)](https://typescriptlang.org)

---

## What this demonstrates

- Full CRUD coverage — GET, POST, PUT, PATCH, DELETE
- **Schema validation** via Zod — catch contract breaks before they hit production
- **Contract tests** — headers, schemas, and response time SLOs in one suite
- **Data-driven tests** — `it.each` for parameterized scenarios
- Auth flow — token extraction and reuse across test suites
- Reusable assertion helpers with descriptive error messages
- CI/CD pipeline with HTML + JUnit reporting

---

## Stack

| Tool | Purpose |
|---|---|
| [SuperTest](https://github.com/ladjs/supertest) | HTTP assertions |
| [Jest](https://jestjs.io) | Test runner |
| [Zod](https://zod.dev) | Schema validation |
| [TypeScript](https://typescriptlang.org) | Type safety |
| GitHub Actions | CI pipeline |
| reqres.in | Target REST API |

---

## Architecture

```
api-testing-suite/
├── src/
│   ├── client/
│   │   └── ApiClient.ts       # Reusable HTTP client with auth support
│   ├── config/
│   │   └── env.ts             # Centralised environment config
│   ├── schemas/
│   │   ├── user.schema.ts     # Zod schemas for user endpoints
│   │   └── auth.schema.ts     # Zod schemas for auth endpoints
│   ├── data/
│   │   └── testData.ts        # Test credentials and payloads
│   └── utils/
│       └── assertions.ts      # Reusable assertion helpers
└── tests/
    ├── auth.test.ts            # Login, register, error handling
    ├── users.test.ts           # Full CRUD + data-driven tests
    └── contracts.test.ts       # Schema, headers, SLO validation
```

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

## Test Coverage

| Suite | Tests | What it covers |
|---|---|---|
| `auth.test.ts` | 8 | Login, register, error states, missing fields |
| `users.test.ts` | 14 | CRUD, pagination, data-driven, 404 handling |
| `contracts.test.ts` | 13 | Schemas, headers, SLOs, status codes |
| **Total** | **35** | |

---

## Key Patterns

### Schema Validation with Zod
```typescript
const UserSchema = z.object({
  id:         z.number().positive(),
  email:      z.string().email(),
  first_name: z.string().min(1),
  avatar:     z.string().url(),
});

assertSchema(UserSchema, res.body.data); // throws with descriptive error on failure
```

### Data-Driven Tests
```typescript
it.each(VALID_USER_IDS)('should return user %i', async (id) => {
  const res = await apiClient.get(`/api/users/${id}`);
  expect(res.status).toBe(200);
});
```

### Response Time SLOs
```typescript
const start = Date.now();
await apiClient.get('/api/users');
assertResponseTime(start, 500); // fails if > 500ms
```

---

Built by [Muhammad Mustafa](https://github.com/mustafaautomation) -- QA Lead & Test Automation Engineer

---
Built by [Quvantic](https://quvantic.com)
