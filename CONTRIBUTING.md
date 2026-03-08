# Contributing to API Testing Suite

## Getting Started

```bash
git clone https://github.com/mustafaautomation/api-testing-suite.git
cd api-testing-suite
npm install
cp .env.example .env
npm test
```

## Development

```bash
npm test              # Run all API tests
npm run test:auth     # Auth suite only
npm run test:users    # Users suite only
npm run test:contracts # Contract tests only
npm run test:coverage # With coverage
npm run typecheck     # Type checking
npm run lint          # ESLint
npm run format:check  # Prettier
```

## Pull Request Process

1. Create a feature branch from `main`
2. Write tests for new endpoints or scenarios
3. Ensure all checks pass: `npm run typecheck && npm run lint && npm test`
4. Submit PR using the provided template
