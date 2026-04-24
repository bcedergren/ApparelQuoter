import { createMocks } from 'node-mocks-http';
import handler from '../../[designId]/versions';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';
import User from '@/models/User';

// Mock the database connection and models
jest.mock('@/utils/dbConnect');
jest.mock('@/models/Design');
jest.mock('@/models/User');

const mockDbConnect = dbConnect as jest.MockedFunction<typeof dbConnect>;
const mockDesign = Design as jest.Mocked<typeof Design>;
const mockUser = User as jest.Mocked<typeof User>;

describe('/api/designs/[designId]/versions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDbConnect.mockResolvedValue(undefined);
    mockDesign.findOneAndUpdate = jest.fn();
    mockUser.findById = jest.fn();
  });

  it('adds a version via POST', async () => {
    mockUser.findById.mockReturnValue({
      select: jest.fn().mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' })
    } as any);
    mockDesign.findOneAndUpdate.mockReturnValue({
      populate: jest.fn().mockReturnValue({
        populate: jest.fn().mockResolvedValue({ _id: 'design123', versions: [] })
      })
    } as any);

    const { req, res } = createMocks({
      method: 'POST',
      query: { designId: 'design123' },
      body: {
        versionNumber: 1,
        fileName: 'design.png',
        fileUrl: '/uploads/design.png',
        fileSize: 1024,
        mimeType: 'image/png'
      }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(201);
  });

  it('returns 400 when required fields are missing', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      query: { designId: 'design123' },
      body: {}
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
  });

  it('returns 405 for unsupported method', async () => {
    const { req, res } = createMocks({
      method: 'GET',
      query: { designId: 'design123' }
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  describe('Error handling', () => {
    it('should return 500 on database error', async () => {
      mockUser.findById.mockReturnValue({
        select: jest.fn().mockResolvedValue({ firstName: 'Jane', lastName: 'Doe' })
      } as any);
      mockDesign.findOneAndUpdate.mockImplementation(() => {
        throw new Error('Database error');
      });

      const { req, res } = createMocks({
        method: 'POST',
        query: { designId: 'design123' },
        body: {
          versionNumber: 1,
          fileName: 'design.png',
          fileUrl: '/uploads/design.png',
          fileSize: 1024,
          mimeType: 'image/png'
        }
      });

      await handler(req, res);

      expect(res._getStatusCode()).toBe(500);
    });
  });
});

// Prevent Next route validator errors when test files are under `pages`.
export default function __testFileRoutePlaceholder() {
  return null;
}
