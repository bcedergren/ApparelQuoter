import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const { designId } = req.query;
  const { companyId } = session.user as any;

  if (!designId || typeof designId !== 'string' || !mongoose.Types.ObjectId.isValid(designId)) {
    return res.status(400).json({ message: 'Invalid design ID' });
  }

  if (req.method === 'GET') {
    try {
      const design = await Design.findOne({
        _id: new mongoose.Types.ObjectId(designId),
        companyId: new mongoose.Types.ObjectId(companyId)
      })
        .populate('customerId', 'name email phone')
        .populate('quoteId', 'quoteId')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email')
        .populate('comments.authorId', 'firstName lastName')
        .populate('comments.resolvedBy', 'firstName lastName')
        .populate('versions.uploadedBy', 'firstName lastName')
        .populate('versions.approvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json(design);
    } catch (error) {
      console.error('Error fetching design:', error);
      res.status(500).json({ message: 'Failed to fetch design' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        title,
        description,
        status,
        priority,
        category,
        tags,
        assignedTo,
        dueDate
      } = req.body;

      const updateData: any = {};

      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (status) updateData.status = status;
      if (priority) updateData.priority = priority;
      if (category) updateData.category = category;
      if (tags !== undefined) updateData.tags = tags;
      if (assignedTo !== undefined) {
        updateData.assignedTo = assignedTo ? new mongoose.Types.ObjectId(assignedTo) : null;
      }
      if (dueDate !== undefined) {
        updateData.dueDate = dueDate ? new Date(dueDate) : null;
      }

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        updateData,
        { new: true, runValidators: true }
      )
        .populate('customerId', 'name email')
        .populate('quoteId', 'quoteId')
        .populate('assignedTo', 'firstName lastName email')
        .populate('createdBy', 'firstName lastName email');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json(design);
    } catch (error) {
      console.error('Error updating design:', error);
      res.status(500).json({ message: 'Failed to update design' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const design = await Design.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(designId),
        companyId: new mongoose.Types.ObjectId(companyId)
      });

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json({ message: 'Design deleted successfully' });
    } catch (error) {
      console.error('Error deleting design:', error);
      res.status(500).json({ message: 'Failed to delete design' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
