import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Design from '@/models/Design';
import User from '@/models/User';

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

  if (req.method === 'POST') {
    try {
      const { text, position } = req.body;

      if (!text || text.trim().length === 0) {
        return res.status(400).json({ message: 'Comment text is required' });
      }

      // Get user details
      const user = await User.findById(session.user.id).select('firstName lastName');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const comment = {
        text: text.trim(),
        authorId: new mongoose.Types.ObjectId(session.user.id),
        authorName: `${user.firstName} ${user.lastName}`,
        createdAt: new Date(),
        position: position || undefined,
        resolved: false
      };

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        { $push: { comments: comment } },
        { new: true }
      )
        .populate('comments.authorId', 'firstName lastName')
        .populate('comments.resolvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(201).json({ message: 'Comment added successfully', design });
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ message: 'Failed to add comment' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { commentId, resolved } = req.body;

      if (!commentId || typeof resolved !== 'boolean') {
        return res.status(400).json({ message: 'Comment ID and resolved status are required' });
      }

      const updateData: any = {
        'comments.$.resolved': resolved
      };

      if (resolved) {
        updateData['comments.$.resolvedBy'] = new mongoose.Types.ObjectId(session.user.id);
        updateData['comments.$.resolvedAt'] = new Date();
      } else {
        updateData['comments.$.resolvedBy'] = null;
        updateData['comments.$.resolvedAt'] = null;
      }

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId),
          'comments._id': new mongoose.Types.ObjectId(commentId)
        },
        { $set: updateData },
        { new: true }
      )
        .populate('comments.authorId', 'firstName lastName')
        .populate('comments.resolvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design or comment not found' });
      }

      res.status(200).json({ message: 'Comment updated successfully', design });
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ message: 'Failed to update comment' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { commentId } = req.body;

      if (!commentId) {
        return res.status(400).json({ message: 'Comment ID is required' });
      }

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        { $pull: { comments: { _id: new mongoose.Types.ObjectId(commentId) } } },
        { new: true }
      )
        .populate('comments.authorId', 'firstName lastName')
        .populate('comments.resolvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json({ message: 'Comment deleted successfully', design });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ message: 'Failed to delete comment' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
