import mongoose from 'mongoose';
import { Report } from '../Report';

// Mock mongoose
jest.mock('mongoose');

describe('Report Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Schema validation', () => {
    it('should create a valid report', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        filters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          }
        },
        columns: ['customer', 'amount', 'date'],
        groupBy: 'customer',
        sortBy: { field: 'date', order: 'desc' }
      };

      const report = new Report(reportData);
      expect(report.reportName).toBe('Sales Report');
      expect(report.reportType).toBe('sales');
    });

    it('should require companyId', () => {
      const reportData = {
        reportName: 'Sales Report',
        reportType: 'sales'
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors.companyId).toBeDefined();
    });

    it('should require reportName', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportType: 'sales'
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors.reportName).toBeDefined();
    });

    it('should require reportType', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report'
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors.reportType).toBeDefined();
    });

    it('should validate reportType enum', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'invalid_type'
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors.reportType).toBeDefined();
    });

    it('should accept valid reportType values', () => {
      const validTypes = ['sales', 'quotes', 'customers', 'inventory', 'revenue'];
      
      validTypes.forEach(type => {
        const reportData = {
          companyId: new mongoose.Types.ObjectId(),
          reportName: 'Test Report',
          reportType: type
        };

        const report = new Report(reportData);
        const validationError = report.validateSync();
        expect(validationError?.errors.reportType).toBeUndefined();
      });
    });

    it('should validate columns array', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount', 'date']
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError).toBeNull();
    });

    it('should require columns array', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales'
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors.columns).toBeDefined();
    });

    it('should validate sortBy schema', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount'],
        sortBy: { field: 'amount', order: 'desc' }
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError).toBeNull();
    });

    it('should validate sortBy order enum', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount'],
        sortBy: { field: 'amount', order: 'invalid_order' }
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors['sortBy.order']).toBeDefined();
    });

    it('should accept valid sortBy order values', () => {
      const validOrders = ['asc', 'desc'];
      
      validOrders.forEach(order => {
        const reportData = {
          companyId: new mongoose.Types.ObjectId(),
          reportName: 'Sales Report',
          reportType: 'sales',
          columns: ['customer', 'amount'],
          sortBy: { field: 'amount', order }
        };

        const report = new Report(reportData);
        const validationError = report.validateSync();
        expect(validationError?.errors['sortBy.order']).toBeUndefined();
      });
    });

    it('should validate schedule schema', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount'],
        schedule: {
          frequency: 'weekly',
          dayOfWeek: 1,
          time: '09:00'
        }
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError).toBeNull();
    });

    it('should validate schedule frequency enum', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount'],
        schedule: {
          frequency: 'invalid_frequency',
          dayOfWeek: 1,
          time: '09:00'
        }
      };

      const report = new Report(reportData);
      const validationError = report.validateSync();
      expect(validationError?.errors['schedule.frequency']).toBeDefined();
    });

    it('should accept valid schedule frequency values', () => {
      const validFrequencies = ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'];
      
      validFrequencies.forEach(frequency => {
        const reportData = {
          companyId: new mongoose.Types.ObjectId(),
          reportName: 'Sales Report',
          reportType: 'sales',
          columns: ['customer', 'amount'],
          schedule: {
            frequency,
            dayOfWeek: 1,
            time: '09:00'
          }
        };

        const report = new Report(reportData);
        const validationError = report.validateSync();
        expect(validationError?.errors['schedule.frequency']).toBeUndefined();
      });
    });
  });

  describe('Pre-save middleware', () => {
    it('should set createdAt and updatedAt', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount']
      };

      const report = new Report(reportData);
      report.save = jest.fn().mockResolvedValue(report);
      
      return report.save().then(() => {
        expect(report.createdAt).toBeDefined();
        expect(report.updatedAt).toBeDefined();
      });
    });
  });

  describe('Methods', () => {
    it('should generate report data correctly', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount', 'date'],
        groupBy: 'customer',
        sortBy: { field: 'amount', order: 'desc' }
      };

      const report = new Report(reportData);
      const mockData = [
        { customer: 'John Doe', amount: 1000, date: '2024-01-15' },
        { customer: 'Jane Smith', amount: 1500, date: '2024-01-16' }
      ];

      const result = report.generateReportData(mockData);
      expect(result).toBeDefined();
      expect(result.data).toEqual(mockData);
      expect(result.metadata).toBeDefined();
    });

    it('should apply filters correctly', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount', 'date'],
        filters: {
          dateRange: {
            start: '2024-01-01',
            end: '2024-01-31'
          },
          status: 'completed'
        }
      };

      const report = new Report(reportData);
      const mockData = [
        { customer: 'John Doe', amount: 1000, date: '2024-01-15', status: 'completed' },
        { customer: 'Jane Smith', amount: 1500, date: '2024-02-16', status: 'pending' }
      ];

      const result = report.applyFilters(mockData);
      expect(result).toHaveLength(1);
      expect(result[0].customer).toBe('John Doe');
    });

    it('should group data correctly', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount', 'date'],
        groupBy: 'customer'
      };

      const report = new Report(reportData);
      const mockData = [
        { customer: 'John Doe', amount: 1000, date: '2024-01-15' },
        { customer: 'John Doe', amount: 500, date: '2024-01-16' },
        { customer: 'Jane Smith', amount: 1500, date: '2024-01-17' }
      ];

      const result = report.groupData(mockData);
      expect(result).toBeDefined();
      expect(Object.keys(result)).toHaveLength(2);
      expect(result['John Doe']).toHaveLength(2);
      expect(result['Jane Smith']).toHaveLength(1);
    });

    it('should sort data correctly', () => {
      const reportData = {
        companyId: new mongoose.Types.ObjectId(),
        reportName: 'Sales Report',
        reportType: 'sales',
        columns: ['customer', 'amount', 'date'],
        sortBy: { field: 'amount', order: 'desc' }
      };

      const report = new Report(reportData);
      const mockData = [
        { customer: 'John Doe', amount: 1000, date: '2024-01-15' },
        { customer: 'Jane Smith', amount: 1500, date: '2024-01-16' },
        { customer: 'Bob Johnson', amount: 500, date: '2024-01-17' }
      ];

      const result = report.sortData(mockData);
      expect(result[0].amount).toBe(1500);
      expect(result[1].amount).toBe(1000);
      expect(result[2].amount).toBe(500);
    });
  });
});
