import mongoose, { Document, Schema } from 'mongoose';

export interface IReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  values?: any[]; // For 'in' and 'not_in' operators
}

export interface IReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  format?: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface IReportGroupBy {
  field: string;
  label: string;
  order: 'asc' | 'desc';
}

export interface IReportSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface IReport extends Document {
  companyId: mongoose.Schema.Types.ObjectId;
  name: string;
  description?: string;
  type: 'sales' | 'customers' | 'inventory' | 'financial' | 'custom';
  dataSource: 'quotes' | 'invoices' | 'customers' | 'sales' | 'inventory' | 'payments';
  filters: IReportFilter[];
  columns: IReportColumn[];
  groupBy?: IReportGroupBy[];
  sort: IReportSort[];
  isPublic: boolean;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  scheduleTime?: string; // HH:MM format
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdBy: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ReportFilterSchema = new Schema<IReportFilter>({
  field: { type: String, required: true },
  operator: { 
    type: String, 
    enum: ['equals', 'not_equals', 'contains', 'not_contains', 'greater_than', 'less_than', 'between', 'in', 'not_in'],
    required: true 
  },
  value: { type: Schema.Types.Mixed },
  values: [{ type: Schema.Types.Mixed }]
});

const ReportColumnSchema = new Schema<IReportColumn>({
  field: { type: String, required: true },
  label: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['string', 'number', 'date', 'currency', 'percentage', 'boolean'],
    required: true 
  },
  format: { type: String },
  aggregate: { 
    type: String, 
    enum: ['sum', 'avg', 'count', 'min', 'max'] 
  }
});

const ReportGroupBySchema = new Schema<IReportGroupBy>({
  field: { type: String, required: true },
  label: { type: String, required: true },
  order: { 
    type: String, 
    enum: ['asc', 'desc'],
    default: 'asc' 
  }
});

const ReportSortSchema = new Schema<IReportSort>({
  field: { type: String, required: true },
  order: { 
    type: String, 
    enum: ['asc', 'desc'],
    default: 'asc' 
  }
});

const ReportSchema = new Schema<IReport>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['sales', 'customers', 'inventory', 'financial', 'custom'],
    required: true
  },
  dataSource: {
    type: String,
    enum: ['quotes', 'invoices', 'customers', 'sales', 'inventory', 'payments'],
    required: true
  },
  filters: { type: [ReportFilterSchema], default: [] },
  columns: { type: [ReportColumnSchema], required: true },
  groupBy: { type: [ReportGroupBySchema] },
  sort: { type: [ReportSortSchema], default: [] },
  isPublic: { type: Boolean, default: false },
  isScheduled: { type: Boolean, default: false },
  scheduleFrequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'quarterly']
  },
  scheduleTime: { type: String }, // HH:MM format
  lastRunAt: { type: Date },
  nextRunAt: { type: Date },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Pre-save middleware
ReportSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate next run time for scheduled reports
  if (this.isScheduled && this.scheduleFrequency && this.scheduleTime) {
    const now = new Date();
    const [hours, minutes] = this.scheduleTime.split(':').map(Number);
    
    let nextRun = new Date();
    nextRun.setHours(hours, minutes, 0, 0);
    
    if (nextRun <= now) {
      switch (this.scheduleFrequency) {
        case 'daily':
          nextRun.setDate(nextRun.getDate() + 1);
          break;
        case 'weekly':
          nextRun.setDate(nextRun.getDate() + 7);
          break;
        case 'monthly':
          nextRun.setMonth(nextRun.getMonth() + 1);
          break;
        case 'quarterly':
          nextRun.setMonth(nextRun.getMonth() + 3);
          break;
      }
    }
    
    this.nextRunAt = nextRun;
  }
  
  next();
});

// Indexes for efficient queries
ReportSchema.index({ companyId: 1, type: 1 });
ReportSchema.index({ createdBy: 1 });
ReportSchema.index({ isScheduled: 1, nextRunAt: 1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
