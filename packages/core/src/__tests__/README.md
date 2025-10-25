# Core Package Tests

This directory contains tests for the `@ytosc/core` package.

## Test Structure

- `outlierScore.test.ts` - Tests for outlier score calculation logic
- `viewParser.test.ts` - Tests for view count parsing and formatting
- `setup.ts` - Test setup and configuration

## Running Tests

From the project root:

```bash
# Run all tests in watch mode
npm test

# Run tests once
npm run test:run

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

## Test Categories

### Normal Tests
Standard unit tests that verify basic functionality and expected behavior.

### Project-Specific Tests
Tests that simulate real-world scenarios specific to YouTube Outlier Score Calculator:
- Viral video detection
- Underperforming video detection
- Mixed content channels
- Various YouTube locales and formats

## Adding New Tests

When adding new tests:
1. Group related tests with `describe()` blocks
2. Use clear, descriptive test names with `it()`
3. Include both normal and edge case tests
4. Add project-specific scenarios when relevant

## Future Enhancements

- [ ] Integration tests with real YouTube data
- [ ] Performance benchmarks
- [ ] Browser extension specific tests
- [ ] Visual regression tests for UI components

