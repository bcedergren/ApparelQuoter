// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

// Used for __tests__/testing-library.js
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

// Mock next-auth
jest.mock('next-auth/react', () => ({
  useSession: jest.fn(),
  getSession: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}))

// Mock server-side next-auth helpers to avoid ESM-only transitive deps in Jest
jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(async () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      companyId: 'test-company-id',
    },
  })),
}))

jest.mock('@/pages/api/auth/[...nextauth]', () => ({
  __esModule: true,
  authOptions: {},
  default: {},
}))

jest.mock('@/utils/dbConnect', () => jest.fn(async () => undefined))

jest.mock('mongoose', () => {
  class MockObjectId {
    static isValid() {
      return true
    }
  }
  class MockSchema {
    static Types = { ObjectId: MockObjectId }
    pre() {}
    post() {}
    index() {}
  }
  const mongooseMock = {
    __esModule: true,
    default: undefined,
    connect: jest.fn(),
    connection: { readyState: 1 },
    Schema: MockSchema,
    Types: { ObjectId: MockObjectId },
    model: jest.fn(() => ({})),
    models: {},
  }
  mongooseMock.default = mongooseMock
  return mongooseMock
})

// Mock next/router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock app layout to avoid SidebarProvider dependency in page tests
jest.mock('@/components/app/Layout', () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}))

// Mock jsPDF
jest.mock('jspdf', () => {
  return jest.fn().mockImplementation(() => ({
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    setTextColor: jest.fn(),
    setFillColor: jest.fn(),
    text: jest.fn(),
    rect: jest.fn(),
    addPage: jest.fn(),
    save: jest.fn(),
    autoTable: jest.fn(),
    internal: {
      pageSize: {
        width: 595.28,
        height: 841.89,
        getWidth: jest.fn(() => 595.28),
        getHeight: jest.fn(() => 841.89),
      }
    }
  }))
})

// Mock formidable
jest.mock('formidable', () => {
  return jest.fn().mockImplementation(() => ({
    parse: jest.fn()
  }))
})

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  renameSync: jest.fn(),
}))

// Mock path
jest.mock('path', () => ({
  join: jest.fn(),
  extname: jest.fn(),
}))

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid'),
}))

// Global fetch mock
global.fetch = jest.fn()

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
}
