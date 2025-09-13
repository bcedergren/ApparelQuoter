export interface Report {
  _id: string;
  companyId: string;
  name: string;
  description?: string;
  type: 'sales' | 'customers' | 'inventory' | 'financial' | 'custom';
  dataSource: 'quotes' | 'invoices' | 'customers' | 'sales' | 'inventory' | 'payments';
  filters: ReportFilter[];
  columns: ReportColumn[];
  groupBy?: ReportGroupBy[];
  sort: ReportSort[];
  isPublic: boolean;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  scheduleTime?: string;
  lastRunAt?: Date;
  nextRunAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilter {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'between' | 'in' | 'not_in';
  value: any;
  values?: any[];
}

export interface ReportColumn {
  field: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'currency' | 'percentage' | 'boolean';
  format?: string;
  aggregate?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

export interface ReportGroupBy {
  field: string;
  label: string;
  order: 'asc' | 'desc';
}

export interface ReportSort {
  field: string;
  order: 'asc' | 'desc';
}

export interface CreateReportRequest {
  name: string;
  description?: string;
  type: 'sales' | 'customers' | 'inventory' | 'financial' | 'custom';
  dataSource: 'quotes' | 'invoices' | 'customers' | 'sales' | 'inventory' | 'payments';
  filters: ReportFilter[];
  columns: ReportColumn[];
  groupBy?: ReportGroupBy[];
  sort: ReportSort[];
  isPublic: boolean;
  isScheduled: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  scheduleTime?: string;
}

export interface UpdateReportRequest {
  name?: string;
  description?: string;
  filters?: ReportFilter[];
  columns?: ReportColumn[];
  groupBy?: ReportGroupBy[];
  sort?: ReportSort[];
  isPublic?: boolean;
  isScheduled?: boolean;
  scheduleFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  scheduleTime?: string;
}

export interface ReportData {
  columns: string[];
  rows: any[][];
  summary?: {
    totalRows: number;
    aggregates?: { [key: string]: any };
  };
}

export interface ReportExportOptions {
  format: 'pdf' | 'excel' | 'csv';
  includeCharts?: boolean;
  includeSummary?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'sales' | 'customers' | 'inventory' | 'financial' | 'custom';
  dataSource: 'quotes' | 'invoices' | 'customers' | 'sales' | 'inventory' | 'payments';
  columns: ReportColumn[];
  filters: ReportFilter[];
  groupBy?: ReportGroupBy[];
  sort: ReportSort[];
  isPublic: boolean;
}
