import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Report from '@/models/Report';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  await dbConnect();

  const { reportId } = req.query;
  const { companyId } = session.user as any;

  if (!reportId || typeof reportId !== 'string' || !mongoose.Types.ObjectId.isValid(reportId)) {
    return res.status(400).json({ message: 'Invalid report ID' });
  }

  if (req.method === 'GET') {
    try {
      const report = await Report.findOne({
        _id: new mongoose.Types.ObjectId(reportId),
        companyId: new mongoose.Types.ObjectId(companyId),
        $or: [
          { isPublic: true },
          { createdBy: new mongoose.Types.ObjectId(session.user.id) }
        ]
      })
        .populate('createdBy', 'firstName lastName email');

      if (!report) {
        return res.status(404).json({ message: 'Report not found' });
      }

      res.status(200).json(report);
    } catch (error) {
      console.error('Error fetching report:', error);
      res.status(500).json({ message: 'Failed to fetch report' });
    }
  } else if (req.method === 'PUT') {
    try {
      const {
        name,
        description,
        filters,
        columns,
        groupBy,
        sort,
        isPublic,
        isScheduled,
        scheduleFrequency,
        scheduleTime
      } = req.body;

      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (filters !== undefined) updateData.filters = filters;
      if (columns !== undefined) updateData.columns = columns;
      if (groupBy !== undefined) updateData.groupBy = groupBy;
      if (sort !== undefined) updateData.sort = sort;
      if (isPublic !== undefined) updateData.isPublic = isPublic;
      if (isScheduled !== undefined) updateData.isScheduled = isScheduled;
      if (scheduleFrequency !== undefined) updateData.scheduleFrequency = scheduleFrequency;
      if (scheduleTime !== undefined) updateData.scheduleTime = scheduleTime;

      const report = await Report.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(reportId),
          companyId: new mongoose.Types.ObjectId(companyId),
          createdBy: new mongoose.Types.ObjectId(session.user.id) // Only creator can update
        },
        updateData,
        { new: true, runValidators: true }
      )
        .populate('createdBy', 'firstName lastName email');

      if (!report) {
        return res.status(404).json({ message: 'Report not found or you do not have permission to update it' });
      }

      res.status(200).json(report);
    } catch (error) {
      console.error('Error updating report:', error);
      res.status(500).json({ message: 'Failed to update report' });
    }
  } else if (req.method === 'DELETE') {
    try {
      const report = await Report.findOneAndDelete({
        _id: new mongoose.Types.ObjectId(reportId),
        companyId: new mongoose.Types.ObjectId(companyId),
        createdBy: new mongoose.Types.ObjectId(session.user.id) // Only creator can delete
      });

      if (!report) {
        return res.status(404).json({ message: 'Report not found or you do not have permission to delete it' });
      }

      res.status(200).json({ message: 'Report deleted successfully' });
    } catch (error) {
      console.error('Error deleting report:', error);
      res.status(500).json({ message: 'Failed to delete report' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
