import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';
import Customer from '@/models/Customer';
import User from '@/models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

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
        priority,
        category,
        assignedTo,
        customerId,
        search,
        tags
      } = req.query;

      const query: any = { companyId: new mongoose.Types.ObjectId(companyId) };

      // Apply filters
      if (status && status !== 'all') {
        query.status = status;
      }

      if (priority && priority !== 'all') {
        query.priority = priority;
      }

      if (category && category !== 'all') {
        query.category = category;
      }

      if (assignedTo && assignedTo !== 'all') {
        query.assignedTo = new mongoose.Types.ObjectId(assignedTo as string);
      }

      if (customerId) {
        query.customerId = new mongoose.Types.ObjectId(customerId as string);
      }

      // Search by title, description, or tags
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { tags: { $in: [new RegExp(search as string, 'i')] } }
        ];
      }

      // Filter by tags
      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
      }

      const skip = (Number(page) - 1) * Number(limit);

      const designs = await Design.find(query)
        .populate('customerId', 'name email')
        .populate('quoteId', 'quoteId')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Design.countDocuments(query);

      res.status(200).json({
        designs,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching designs:', error);
      res.status(500).json({ message: 'Failed to fetch designs' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        customerId,
        quoteId,
        title,
        description,
        priority = 'medium',
        category = 'apparel',
        tags = [],
        assignedTo,
        dueDate
      } = req.body;

      // Validate required fields
      if (!customerId || !title) {
        return res.status(400).json({ message: 'Customer ID and title are required' });
      }

      const design = new Design({
        companyId: new mongoose.Types.ObjectId(companyId),
        customerId: new mongoose.Types.ObjectId(customerId),
        quoteId: quoteId ? new mongoose.Types.ObjectId(quoteId) : undefined,
        title,
        description,
        priority,
        category,
        tags,
        assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        createdBy: new mongoose.Types.ObjectId(session.user.id),
        status: 'draft'
      });

      await design.save();

      // Populate the response
      await design.populate('customerId', 'name email');
      if (quoteId) {
        await design.populate('quoteId', 'quoteId');
      }
      if (assignedTo) {
        await design.populate('assignedTo', 'firstName lastName email');
      }
      await design.populate('createdBy', 'firstName lastName email');

      res.status(201).json(design);
    } catch (error) {
      console.error('Error creating design:', error);
      res.status(500).json({ message: 'Failed to create design' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
