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
      const { versionNumber, fileName, fileUrl, fileSize, mimeType, notes } = req.body;

      if (!versionNumber || !fileName || !fileUrl || !fileSize || !mimeType) {
        return res.status(400).json({ message: 'Missing required version fields' });
      }

      // Get user details
      const user = await User.findById(session.user.id).select('firstName lastName');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      const version = {
        versionNumber,
        fileName,
        fileUrl,
        fileSize: parseInt(fileSize),
        mimeType,
        uploadedBy: new mongoose.Types.ObjectId(session.user.id),
        uploadedAt: new Date(),
        isApproved: false,
        notes: notes || ''
      };

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        { $push: { versions: version } },
        { new: true }
      )
        .populate('versions.uploadedBy', 'firstName lastName')
        .populate('versions.approvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(201).json({ message: 'Version uploaded successfully', design });
    } catch (error) {
      console.error('Error uploading version:', error);
      res.status(500).json({ message: 'Failed to upload version' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { versionId, isApproved, notes } = req.body;

      if (!versionId || typeof isApproved !== 'boolean') {
        return res.status(400).json({ message: 'Version ID and approval status are required' });
      }

      const updateData: any = {
        'versions.$.isApproved': isApproved
      };

      if (notes !== undefined) {
        updateData['versions.$.notes'] = notes;
      }

      if (isApproved) {
        updateData['versions.$.approvedBy'] = new mongoose.Types.ObjectId(session.user.id);
        updateData['versions.$.approvedAt'] = new Date();
      } else {
        updateData['versions.$.approvedBy'] = null;
        updateData['versions.$.approvedAt'] = null;
      }

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId),
          'versions._id': new mongoose.Types.ObjectId(versionId)
        },
        { $set: updateData },
        { new: true }
      )
        .populate('versions.uploadedBy', 'firstName lastName')
        .populate('versions.approvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design or version not found' });
      }

      res.status(200).json({ message: 'Version updated successfully', design });
    } catch (error) {
      console.error('Error updating version:', error);
      res.status(500).json({ message: 'Failed to update version' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const { versionId } = req.body;

      if (!versionId) {
        return res.status(400).json({ message: 'Version ID is required' });
      }

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        { $pull: { versions: { _id: new mongoose.Types.ObjectId(versionId) } } },
        { new: true }
      )
        .populate('versions.uploadedBy', 'firstName lastName')
        .populate('versions.approvedBy', 'firstName lastName');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json({ message: 'Version deleted successfully', design });
    } catch (error) {
      console.error('Error deleting version:', error);
      res.status(500).json({ message: 'Failed to delete version' });
    }
  } else {
    res.setHeader('Allow', ['POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
