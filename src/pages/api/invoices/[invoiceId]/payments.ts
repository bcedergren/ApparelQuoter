import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Invoice from '@/models/Invoice';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const { invoiceId } = req.query;
  const { companyId } = session.user as any;

  if (!invoiceId || typeof invoiceId !== 'string' || !mongoose.Types.ObjectId.isValid(invoiceId)) {
    return res.status(400).json({ message: 'Invalid invoice ID' });
  }

  if (req.method === 'POST') {
    try {
      const { amount, paymentMethod, reference, notes } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid payment amount' });
      }

      const invoice = await Invoice.findOne({
        _id: new mongoose.Types.ObjectId(invoiceId),
        companyId: new mongoose.Types.ObjectId(companyId)
      });

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      // Add payment
      const payment = {
        amount,
        paymentDate: new Date(),
        paymentMethod,
        reference,
        notes
      };

      invoice.payments.push(payment);
      await invoice.save();

      res.status(201).json({ message: 'Payment added successfully', invoice });
    } catch (error) {
      console.error('Error adding payment:', error);
      res.status(500).json({ message: 'Failed to add payment' });
    }
  } else if (req.method === 'GET') {
    try {
      const invoice = await Invoice.findOne({
        _id: new mongoose.Types.ObjectId(invoiceId),
        companyId: new mongoose.Types.ObjectId(companyId)
      }).select('payments');

      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      res.status(200).json({ payments: invoice.payments });
    } catch (error) {
      console.error('Error fetching payments:', error);
      res.status(500).json({ message: 'Failed to fetch payments' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
