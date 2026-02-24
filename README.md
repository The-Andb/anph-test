# @the-andb/test

Centralized test suite for The Andb project.

## Structure

```
andb-test/
├── integration/          # Integration tests (Docker-based)
│   ├── mysql-docker.spec.ts
│   └── jest.config.js
├── e2e/                  # End-to-end tests
│   └── jest.config.js
├── fixtures/             # Shared test data & configs
│   └── database.fixtures.ts
├── setup/                # Test setup files
│   ├── integration.setup.ts
│   └── e2e.setup.ts
└── package.json
```

## Prerequisites

### Docker Services

```bash
cd docker && docker-compose up -d
```

This starts:

- `mysql-dev` (port 3306)
- `mysql-stage` (port 3307)
- `mysql-uat` (port 3308)
- `mysql-prod` (port 3309)
- `ssh-server` (port 2222)

## Running Tests

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### All Tests

```bash
npm run test:all
```

## Docker Management

```bash
# Start Docker services
npm run docker:up

# Stop Docker services
npm run docker:down

# Reset (stop + start)
npm run docker:reset
```

## Adding New Tests

1. **Integration tests**: Add to `integration/` folder with `.spec.ts` extension
2. **E2E tests**: Add to `e2e/` folder with `.spec.ts` extension
3. **Shared fixtures**: Add to `fixtures/` folder
