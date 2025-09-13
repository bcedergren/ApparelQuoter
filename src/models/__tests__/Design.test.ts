import mongoose from 'mongoose';
import { Design } from '../Design';

// Mock mongoose
jest.mock('mongoose');

describe('Design Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema validation', () => {
    it('should create a valid design', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        description: 'Company logo design',
        status: 'draft',
        priority: 'medium',
        assignedTo: new mongoose.Types.ObjectId()
      };

      const design = new Design(designData);
      expect(design.designName).toBe('Logo Design');
      expect(design.status).toBe('draft');
      expect(design.priority).toBe('medium');
    });

    it('should require companyId', () => {
      const designData = {
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design'
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors.companyId).toBeDefined();
    });

    it('should require customerId', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design'
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors.customerId).toBeDefined();
    });

    it('should require designName', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId()
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors.designName).toBeDefined();
    });

    it('should validate status enum', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        status: 'invalid_status'
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors.status).toBeDefined();
    });

    it('should accept valid status values', () => {
      const validStatuses = ['draft', 'in_progress', 'review', 'approved', 'rejected', 'completed'];
      
      validStatuses.forEach(status => {
        const designData = {
          companyId: new mongoose.Types.ObjectId(),
          customerId: new mongoose.Types.ObjectId(),
          designName: 'Logo Design',
          status
        };

        const design = new Design(designData);
        const validationError = design.validateSync();
        expect(validationError?.errors.status).toBeUndefined();
      });
    });

    it('should validate priority enum', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        priority: 'invalid_priority'
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors.priority).toBeDefined();
    });

    it('should accept valid priority values', () => {
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      
      validPriorities.forEach(priority => {
        const designData = {
          companyId: new mongoose.Types.ObjectId(),
          customerId: new mongoose.Types.ObjectId(),
          designName: 'Logo Design',
          priority
        };

        const design = new Design(designData);
        const validationError = design.validateSync();
        expect(validationError?.errors.priority).toBeUndefined();
      });
    });

    it('should validate version schema', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        versions: [
          {
            versionNumber: 1,
            fileUrl: '/uploads/design_v1.png',
            description: 'Initial version',
            uploadedBy: 'John Doe'
          }
        ]
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError).toBeNull();
    });

    it('should require version fileUrl', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        versions: [
          {
            versionNumber: 1,
            description: 'Initial version'
          }
        ]
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors['versions.0.fileUrl']).toBeDefined();
    });

    it('should require version versionNumber', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        versions: [
          {
            fileUrl: '/uploads/design_v1.png',
            description: 'Initial version'
          }
        ]
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors['versions.0.versionNumber']).toBeDefined();
    });

    it('should validate comment schema', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        comments: [
          {
            text: 'Great design!',
            author: 'John Doe',
            x: 100,
            y: 200
          }
        ]
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError).toBeNull();
    });

    it('should require comment text', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        comments: [
          {
            author: 'John Doe'
          }
        ]
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors['comments.0.text']).toBeDefined();
    });

    it('should require comment author', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        comments: [
          {
            text: 'Great design!'
          }
        ]
      };

      const design = new Design(designData);
      const validationError = design.validateSync();
      expect(validationError?.errors['comments.0.author']).toBeDefined();
    });
  });

  describe('Pre-save middleware', () => {
    it('should set currentVersion to 0 if not provided', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design'
      };

      const design = new Design(designData);
      design.save = jest.fn().mockResolvedValue(design);
      
      return design.save().then(() => {
        expect(design.currentVersion).toBe(0);
      });
    });

    it('should set createdAt and updatedAt', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design'
      };

      const design = new Design(designData);
      design.save = jest.fn().mockResolvedValue(design);
      
      return design.save().then(() => {
        expect(design.createdAt).toBeDefined();
        expect(design.updatedAt).toBeDefined();
      });
    });
  });

  describe('Methods', () => {
    it('should add version correctly', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        versions: [],
        currentVersion: 0
      };

      const design = new Design(designData);
      design.addVersion({
        fileUrl: '/uploads/design_v1.png',
        description: 'Initial version',
        uploadedBy: 'John Doe'
      });

      expect(design.versions).toHaveLength(1);
      expect(design.versions[0].versionNumber).toBe(1);
      expect(design.currentVersion).toBe(1);
    });

    it('should add comment correctly', () => {
      const designData = {
        companyId: new mongoose.Types.ObjectId(),
        customerId: new mongoose.Types.ObjectId(),
        designName: 'Logo Design',
        comments: []
      };

      const design = new Design(designData);
      design.addComment({
        text: 'Great design!',
        author: 'John Doe',
        x: 100,
        y: 200
      });

      expect(design.comments).toHaveLength(1);
      expect(design.comments[0].text).toBe('Great design!');
    });
  });
});
