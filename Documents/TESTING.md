# Testing Documentation

This document provides comprehensive information about the testing suite for the ApparelQuoter application.

## Overview

The testing suite ensures that all functionality works as expected across the entire application, including:
- API endpoints (CRUD operations, data validation, error handling)
- Database models (schema validation, methods, middleware)
- Utility functions (PDF generation, currency formatting)
- React components (user interactions, state management, UI rendering)
- Integration workflows (end-to-end business processes)

## Test Structure

```
src/
├── __tests__/
│   └── integration/
│       ├── invoice-workflow.test.ts
│       ├── design-workflow.test.ts
│       ├── report-workflow.test.ts
│       └── end-to-end.test.ts
├── pages/api/
│   ├── invoices/__tests__/
│   │   ├── index.test.ts
│   │   ├── [invoiceId].test.ts
│   │   └── [invoiceId]/payments.test.ts
│   ├── designs/__tests__/
│   │   ├── index.test.ts
│   │   ├── [designId].test.ts
│   │   ├── [designId]/comments.test.ts
│   │   ├── [designId]/versions.test.ts
│   │   └── upload.test.ts
│   └── reports/__tests__/
│       ├── index.test.ts
│       ├── [reportId].test.ts
│       └── [reportId]/data.test.ts
├── models/__tests__/
│   ├── Invoice.test.ts
│   ├── Design.test.ts
│   └── Report.test.ts
├── utils/__tests__/
│   ├── invoicePdfGenerator.test.ts
│   └── currency.test.ts
└── pages/app/__tests__/
    ├── invoice.test.tsx
    ├── designs.test.tsx
    └── reports.test.tsx
```

## Test Categories

### 1. API Endpoint Tests
- **Invoice API**: CRUD operations, payment management, PDF generation
- **Design API**: CRUD operations, file uploads, version control, comments
- **Report API**: CRUD operations, data generation, filtering, export

### 2. Database Model Tests
- **Schema Validation**: Required fields, data types, enums, custom validation
- **Methods**: Business logic, calculations, data transformations
- **Middleware**: Pre-save hooks, virtual fields, computed properties

### 3. Utility Function Tests
- **PDF Generation**: Invoice PDF creation, formatting, layout
- **Currency Utils**: Formatting, parsing, calculations, tax computation

### 4. React Component Tests
- **Page Components**: Rendering, user interactions, state management
- **Form Handling**: Input validation, submission, error states
- **UI Components**: Button clicks, navigation, filtering, pagination

### 5. Integration Tests
- **Workflow Tests**: Complete business processes from start to finish
- **End-to-End Tests**: Full user journeys across multiple features
- **Error Recovery**: Handling failures and rollback scenarios

## Running Tests

### Prerequisites
```bash
npm install
```

### Test Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run tests for CI/CD
npm run test:ci
```

### Running Specific Test Suites
```bash
# Run only API tests
npm test -- --testPathPattern="api"

# Run only model tests
npm test -- --testPathPattern="models"

# Run only integration tests
npm test -- --testPathPattern="integration"

# Run only component tests
npm test -- --testPathPattern="pages/app"
```

## Test Configuration

### Jest Configuration (`jest.config.js`)
- **Environment**: jsdom for React component testing
- **Module Mapping**: Path aliases for clean imports
- **Coverage Thresholds**: 70% minimum coverage required
- **Test Patterns**: Comprehensive file matching patterns

### Setup File (`jest.setup.js`)
- **Global Mocks**: Next.js, next-auth, jsPDF, formidable
- **Testing Library**: Jest DOM matchers
- **Console Mocking**: Reduced noise in test output

## Test Coverage

The test suite aims for comprehensive coverage across:
- **Statements**: 70% minimum
- **Branches**: 70% minimum  
- **Functions**: 70% minimum
- **Lines**: 70% minimum

### Coverage Reports
Coverage reports are generated in the `coverage/` directory and include:
- HTML report for detailed analysis
- JSON data for CI/CD integration
- LCOV format for coverage tools

## Mocking Strategy

### Database Mocking
- **Mongoose Models**: Mocked using Jest mocks
- **Database Connection**: Mocked dbConnect utility
- **Query Methods**: Mocked find, create, save, delete operations

### External Dependencies
- **Next.js**: Router, Image, and other Next.js components
- **Authentication**: next-auth session management
- **File Uploads**: formidable for multipart form handling
- **PDF Generation**: jsPDF for document creation

### API Mocking
- **Fetch API**: Global fetch mock for API calls
- **HTTP Requests**: node-mocks-http for request/response simulation

## Test Data

### Sample Data
Tests use consistent mock data across the suite:
- **Customers**: John Doe, Jane Smith with realistic contact information
- **Companies**: Test company with business details
- **Invoices**: Sample invoice data with items and payments
- **Designs**: Mock design projects with versions and comments
- **Reports**: Various report types with different configurations

### Data Relationships
Test data maintains proper relationships:
- Invoices linked to customers and companies
- Designs associated with quotes and customers
- Reports filtered by company and date ranges
- Payments connected to specific invoices

## Best Practices

### Test Organization
- **Descriptive Names**: Clear test descriptions explaining what is being tested
- **Arrange-Act-Assert**: Consistent test structure
- **Single Responsibility**: Each test focuses on one specific behavior
- **Independent Tests**: Tests don't depend on each other

### Error Testing
- **Happy Path**: Normal operation scenarios
- **Edge Cases**: Boundary conditions and limits
- **Error Conditions**: Invalid inputs, missing data, system failures
- **Recovery Scenarios**: How the system handles and recovers from errors

### Performance Considerations
- **Mock Heavy Operations**: Database calls, file uploads, PDF generation
- **Parallel Execution**: Tests run independently and in parallel
- **Fast Feedback**: Quick test execution for development workflow

## Continuous Integration

### CI/CD Integration
The test suite is designed for CI/CD pipelines:
- **Non-Interactive**: Tests run without user input
- **Deterministic**: Consistent results across environments
- **Coverage Reporting**: Automated coverage collection
- **Failure Reporting**: Clear error messages and stack traces

### Pre-commit Hooks
Recommended pre-commit hooks:
```bash
# Run tests before commit
npm run test:ci

# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## Troubleshooting

### Common Issues
1. **Mock Not Working**: Ensure mocks are properly configured in jest.setup.js
2. **Async Tests**: Use async/await or return promises for async operations
3. **Component Rendering**: Mock required props and context providers
4. **Database Errors**: Verify mongoose mocks are properly set up

### Debug Mode
Run tests in debug mode for detailed output:
```bash
npm test -- --verbose
```

### Test Isolation
If tests are interfering with each other:
- Check for shared state between tests
- Ensure proper cleanup in afterEach hooks
- Verify mocks are reset between tests

## Future Enhancements

### Planned Improvements
- **Visual Regression Testing**: Screenshot comparisons for UI components
- **Performance Testing**: Load testing for API endpoints
- **Accessibility Testing**: Automated a11y testing
- **E2E Testing**: Playwright or Cypress for full browser testing

### Test Maintenance
- **Regular Updates**: Keep test dependencies up to date
- **Refactoring**: Update tests when code changes
- **Coverage Monitoring**: Track coverage trends over time
- **Performance Monitoring**: Ensure tests run quickly

## Contributing

### Adding New Tests
1. Follow existing naming conventions
2. Place tests in appropriate directories
3. Use descriptive test names
4. Include both positive and negative test cases
5. Update this documentation if needed

### Test Review Process
- All new features must include tests
- Tests must pass before merging
- Coverage thresholds must be maintained
- Integration tests for complex workflows

This testing suite ensures the ApparelQuoter application is robust, reliable, and maintainable. The comprehensive test coverage provides confidence in the application's functionality and helps prevent regressions during development.
