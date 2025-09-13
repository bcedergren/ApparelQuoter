import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const { invoiceId } = req.query;
  const { companyId } = session.user as any;

  if (!invoiceId || typeof invoiceId !== 'string' || !mongoose.Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({ message: 'Invalid invoice ID' });
  }

  if (req.method === 'GET') {
    try {
      const invoice = await Invoice.findOne({
        _id: new mongoose.Types.ObjectId(invoiceId),
        companyId: new mongoose.Types.ObjectId(companyId)
      })
        .populate('customerId', 'name email phone address')
        .populate('quoteId', 'quoteId')
        .populate('createdBy', 'firstName lastName email');

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.status(200).json(invoice);
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({ message: 'Failed to fetch invoice' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        invoiceDate,
        dueDate,
        items,
        taxRate,
        discountAmount,
        notes,
        terms,
        status
      } = req.body;

      const updateData: any = {};

      if (invoiceDate) updateData.invoiceDate = new Date(invoiceDate);
      if (dueDate) updateData.dueDate = new Date(dueDate);
      if (items) {
        updateData.items = items.map((item: any) => ({
          ...item,
          total: item.quantity * item.unitPrice
        }));
      }
      if (taxRate !== undefined) updateData.taxRate = taxRate;
      if (discountAmount !== undefined) updateData.discountAmount = discountAmount;
      if (notes !== undefined) updateData.notes = notes;
      if (terms !== undefined) updateData.terms = terms;
      if (status) updateData.status = status;

      // Update sent date if status is being changed to 'sent'
      if (status === 'sent') {
        updateData.sentDate = new Date();
      }

      const invoice = await Invoice.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(invoiceId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        updateData,
        { new: true, runValidators: true }
      )
        .populate('customerId', 'name email phone')
        .populate('quoteId', 'quoteId');

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.status(200).json(invoice);
    } catch (error) {
      console.error('Error updating invoice:', error);
      res.status(500).json({ message: 'Failed to update invoice' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const invoice = await Invoice.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(invoiceId),
        companyId: new mongoose.Types.ObjectId(companyId)
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.status(200).json({ message: 'Invoice deleted successfully' });
    } catch (error) {
      console.error('Error deleting invoice:', error);
      res.status(500).json({ message: 'Failed to delete invoice' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
