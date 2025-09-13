import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Report, { IReportColumn } from '@/models/Report';
import Quote from '@/models/Quote';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Sale from '@/models/Sale';
import Inventory from '@/models/Inventory';
import Payment from '@/models/Payment';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const { reportId } = req.query;
  const { companyId } = session.user as any;

  if (!reportId || typeof reportId !== 'string' || !mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).json({ message: 'Invalid report ID' });
  }

  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const report = await Report.findOne({
      _id: new mongoose.Types.ObjectId(reportId),
      companyId: new mongoose.Types.ObjectId(companyId),
      $or: [
        { isPublic: true },
        { createdBy: new mongoose.Types.ObjectId(session.user.id) }
      ]
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Build MongoDB query based on filters
    const query = buildQuery(report.filters, companyId);
    
    // Get data based on data source
    let data: any[] = [];
    let Model: any;

    switch (report.dataSource) {
      case 'quotes':
        Model = Quote;
        break;
      case 'invoices':
        Model = Invoice;
        break;
      case 'customers':
        Model = Customer;
        break;
      case 'sales':
        Model = Sale;
        break;
      case 'inventory':
        Model = Inventory;
        break;
      case 'payments':
        Model = Payment;
        break;
      default:
        return res.status(400).json({ message: 'Invalid data source' });
    }

    // Execute query with aggregation if groupBy is specified
    if (report.groupBy && report.groupBy.length > 0) {
      data = await executeGroupedQuery(Model, query, report);
    } else {
      data = await Model.find(query)
        .populate('customerId', 'name email')
        .populate('companyId', 'name')
        .sort(buildSort(report.sort))
        .lean();
    }

    // Transform data based on columns
    const transformedData = transformData(data, report.columns);

    // Calculate aggregates
    const aggregates = calculateAggregates(data, report.columns);

    // Update last run time
    await Report.findByIdAndUpdate(reportId, { lastRunAt: new Date() });

    res.status(200).json({
      columns: report.columns.map((col: IReportColumn) => col.label),
      rows: transformedData,
      summary: {
        totalRows: transformedData.length,
        aggregates
      }
    });
  } catch (error) {
    console.error('Error generating report data:', error);
    res.status(500).json({ message: 'Failed to generate report data' });
  }
}

function buildQuery(filters: any[], companyId: string) {
  const query: any = { companyId: new mongoose.Types.ObjectId(companyId) };

  filters.forEach(filter => {
    const { field, operator, value, values } = filter;

    switch (operator) {
      case 'equals':
        query[field] = value;
        break;
      case 'not_equals':
        query[field] = { $ne: value };
        break;
      case 'contains':
        query[field] = { $regex: value, $options: 'i' };
        break;
      case 'not_contains':
        query[field] = { $not: { $regex: value, $options: 'i' } };
        break;
      case 'greater_than':
        query[field] = { $gt: value };
        break;
      case 'less_than':
        query[field] = { $lt: value };
        break;
      case 'between':
        query[field] = { $gte: value[0], $lte: value[1] };
        break;
      case 'in':
        query[field] = { $in: values };
        break;
      case 'not_in':
        query[field] = { $nin: values };
        break;
    }
  });

  return query;
}

function buildSort(sort: any[]) {
  const sortObj: any = {};
  sort.forEach(s => {
    sortObj[s.field] = s.order === 'asc' ? 1 : -1;
  });
  return sortObj;
}

async function executeGroupedQuery(Model: any, query: any, report: any) {
  const pipeline: any[] = [
    { $match: query }
  ];

  // Add group stage
  const groupStage: any = {
    _id: {}
  };

  report.groupBy.forEach((group: any) => {
    groupStage._id[group.field] = `$${group.field}`;
  });

  // Add aggregations for each column
  report.columns.forEach((column: any) => {
    if (column.aggregate) {
      switch (column.aggregate) {
        case 'sum':
          groupStage[`${column.field}_sum`] = { $sum: `$${column.field}` };
          break;
        case 'avg':
          groupStage[`${column.field}_avg`] = { $avg: `$${column.field}` };
          break;
        case 'count':
          groupStage[`${column.field}_count`] = { $sum: 1 };
          break;
        case 'min':
          groupStage[`${column.field}_min`] = { $min: `$${column.field}` };
          break;
        case 'max':
          groupStage[`${column.field}_max`] = { $max: `$${column.field}` };
          break;
      }
    }
  });

  pipeline.push({ $group: groupStage });

  // Add sort stage
  if (report.sort && report.sort.length > 0) {
    const sortStage: any = {};
    report.sort.forEach((sort: any) => {
      sortStage[sort.field] = sort.order === 'asc' ? 1 : -1;
    });
    pipeline.push({ $sort: sortStage });
  }

  return await Model.aggregate(pipeline);
}

function transformData(data: any[], columns: any[]) {
  return data.map(item => {
    const row: any[] = [];
    
    columns.forEach(column => {
      let value = getNestedValue(item, column.field);
      
      // Apply formatting based on column type
      switch (column.type) {
        case 'currency':
          value = formatCurrency(value);
          break;
        case 'date':
          value = formatDate(value, column.format);
          break;
        case 'percentage':
          value = formatPercentage(value);
          break;
        case 'number':
          value = formatNumber(value, column.format);
          break;
        case 'boolean':
          value = value ? 'Yes' : 'No';
          break;
        default:
          value = value || '';
      }
      
      row.push(value);
    });
    
    return row;
  });
}

function getNestedValue(obj: any, path: string) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : null;
  }, obj);
}

function formatCurrency(value: any) {
  if (value === null || value === undefined) return '$0.00';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(parseFloat(value));
}

function formatDate(value: any, format?: string) {
  if (!value) return '';
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  
  if (format) {
    // Simple format implementation
    return date.toLocaleDateString('en-US');
  }
  
  return date.toLocaleDateString('en-US');
}

function formatPercentage(value: any) {
  if (value === null || value === undefined) return '0%';
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 2
  }).format(parseFloat(value) / 100);
}

function formatNumber(value: any, format?: string) {
  if (value === null || value === undefined) return '0';
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  
  if (format) {
    return num.toFixed(parseInt(format) || 2);
  }
  
  return num.toString();
}

function calculateAggregates(data: any[], columns: any[]) {
  const aggregates: any = {};
  
  columns.forEach(column => {
    if (column.aggregate) {
      const values = data.map(item => getNestedValue(item, column.field)).filter(v => v !== null && v !== undefined);
      
      switch (column.aggregate) {
        case 'sum':
          aggregates[column.field] = values.reduce((sum, val) => sum + parseFloat(val || 0), 0);
          break;
        case 'avg':
          aggregates[column.field] = values.length > 0 ? values.reduce((sum, val) => sum + parseFloat(val || 0), 0) / values.length : 0;
          break;
        case 'count':
          aggregates[column.field] = values.length;
          break;
        case 'min':
          aggregates[column.field] = values.length > 0 ? Math.min(...values.map(v => parseFloat(v || 0))) : 0;
          break;
        case 'max':
          aggregates[column.field] = values.length > 0 ? Math.max(...values.map(v => parseFloat(v || 0))) : 0;
          break;
      }
    }
  });
  
  return aggregates;
}
