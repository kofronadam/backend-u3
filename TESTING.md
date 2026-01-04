# TESTING

This project contains unit tests for the ShoppingList endpoints.

How to run tests locally:

1. Install dependencies
```bash
npm install
```

2. Run tests
```bash
npm test
```

Notes:
- Tests are unit tests and mock the database model (no real database required).
- Jest is configured to run in Node environment; we use `--runInBand` to avoid concurrency issues in some environments.
- CI was intentionally NOT added per user request.
