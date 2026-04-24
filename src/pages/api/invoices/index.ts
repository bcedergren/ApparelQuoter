import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';
import Customer from '@/models/Customer';
import Company from '@/models/Company';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const { companyId } = session.user as any;

  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 10, 
        status, 
        customerId, 
        startDate, 
        endDate,
        search 
      } = req.query;

      const query: any = { companyId: new mongoose.Types.ObjectId(companyId) };

      // Filter by status
      if (status && status !== 'all') {
        query.status = status;
      }

      // Filter by customer
      if (customerId) {
        query.customerId = new mongoose.Types.ObjectId(customerId as string);
      }

      // Filter by date range
      if (startDate || endDate) {
        query.invoiceDate = {};
        if (startDate) {
          query.invoiceDate.$gte = new Date(startDate as string);
        }
        if (endDate) {
          query.invoiceDate.$lte = new Date(endDate as string);
        }
      }

      // Search by invoice number or customer name
      if (search) {
        const customerIds = await Customer.find({
          companyId: new mongoose.Types.ObjectId(companyId),
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }).distinct('_id');

        query.$or = [
          { invoiceNumber: { $regex: search, $options: 'i' } },
          { customerId: { $in: customerIds } }
        ];
      }

      const skip = (Number(page) - 1) * Number(limit);

      const invoices = await Invoice.find(query)
        .populate('customerId', 'name email phone')
        .populate('quoteId', 'quoteId')
        .sort({ invoiceDate: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Invoice.countDocuments(query);

      res.status(200).json({
        invoices,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({ message: 'Failed to fetch invoices' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        customerId,
        quoteId,
        invoiceDate,
        dueDate,
        items,
        taxRate = 0,
        discountAmount = 0,
        notes,
        terms
      } = req.body;

      // Validate required fields
      if (!customerId || !items || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      // Calculate item totals
      const itemsWithTotals = items.map((item: any) => ({
        ...item,
        total: item.quantity * item.unitPrice
      }));

      // Generate invoice number
      const invoiceCount = await Invoice.countDocuments({ companyId: new mongoose.Types.ObjectId(companyId) });
      const invoiceNumber = `INV-${String(invoiceCount + 1).padStart(6, '0')}`;

      const invoice = new Invoice({
        companyId: new mongoose.Types.ObjectId(companyId),
        customerId: new mongoose.Types.ObjectId(customerId),
        quoteId: quoteId ? new mongoose.Types.ObjectId(quoteId) : undefined,
        invoiceNumber,
        invoiceDate: new Date(invoiceDate),
        dueDate: new Date(dueDate),
        items: itemsWithTotals,
        taxRate,
        discountAmount,
        notes,
        terms,
        createdBy: new mongoose.Types.ObjectId(session.user.id),
        status: 'draft'
      });

      await invoice.save();

      // Populate the response
      await invoice.populate('customerId', 'name email phone');
      if (quoteId) {
        await invoice.populate('quoteId', 'quoteId');
      }

      res.status(201).json(invoice);
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({ message: 'Failed to create invoice' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
