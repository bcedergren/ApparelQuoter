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
      }).select('placement versions');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json({ placement: (design as any).placement || null, versions: design.versions || [] });
    } catch (error) {
      console.error('Error fetching placement:', error);
      res.status(500).json({ message: 'Failed to fetch placement' });
    }
  } else if (req.method === 'PUT') {
    try {
      const { apparelImageUrl, areaId, logoVersionId, position, widthInches, rotation } = req.body || {};

      if (!apparelImageUrl || !areaId || !logoVersionId || !position || widthInches == null || rotation == null) {
        return res.status(400).json({ message: 'Missing placement fields' });
      }

      const update = {
        placement: {
          apparelImageUrl,
          areaId,
          logoVersionId: new mongoose.Types.ObjectId(logoVersionId),
          position,
          widthInches,
          rotation
        }
      } as any;

      const design = await Design.findOneAndUpdate(
        {
          _id: new mongoose.Types.ObjectId(designId),
          companyId: new mongoose.Types.ObjectId(companyId)
        },
        update,
        { new: true, runValidators: true }
      ).select('placement');

      if (!design) {
        return res.status(404).json({ message: 'Design not found' });
      }

      res.status(200).json({ message: 'Placement saved', placement: (design as any).placement });
    } catch (error) {
      console.error('Error saving placement:', error);
      res.status(500).json({ message: 'Failed to save placement' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}


