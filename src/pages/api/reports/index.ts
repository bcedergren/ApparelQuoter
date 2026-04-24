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

  const { companyId } = session.user as any;

  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 10, 
        type, 
        search 
      } = req.query;

      const query: any = { 
        companyId: new mongoose.Types.ObjectId(companyId),
        $or: [
          { isPublic: true },
          { createdBy: new mongoose.Types.ObjectId(session.user.id) }
        ]
      };

      // Filter by type
      if (type && type !== 'all') {
        query.type = type;
      }

      // Search by name or description
      if (search) {
        query.$and = [
          query.$or,
          {
            $or: [
              { name: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ]
          }
        ];
        delete query.$or;
      }

      const skip = (Number(page) - 1) * Number(limit);

      const reports = await Report.find(query)
        .populate('createdBy', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit));

      const total = await Report.countDocuments(query);

      res.status(200).json({
        reports,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching reports:', error);
      res.status(500).json({ message: 'Failed to fetch reports' });
    }
  } else if (req.method === 'POST') {
    try {
      const {
        name,
        description,
        type,
        dataSource,
        filters = [],
        columns,
        groupBy = [],
        sort = [],
        isPublic = false,
        isScheduled = false,
        scheduleFrequency,
        scheduleTime
      } = req.body;

      // Validate required fields
      if (!name || !type || !dataSource || !columns || columns.length === 0) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const report = new Report({
        companyId: new mongoose.Types.ObjectId(companyId),
        name,
        description,
        type,
        dataSource,
        filters,
        columns,
        groupBy,
        sort,
        isPublic,
        isScheduled,
        scheduleFrequency,
        scheduleTime,
        createdBy: new mongoose.Types.ObjectId(session.user.id)
      });

      await report.save();

      // Populate the response
      await report.populate('createdBy', 'firstName lastName email');

      res.status(201).json(report);
    } catch (error) {
      console.error('Error creating report:', error);
      res.status(500).json({ message: 'Failed to create report' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
