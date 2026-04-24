import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import dbConnect from '@/utils/dbConnect'
import Inventory from '@/models/Inventory'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await dbConnect()

  const { id } = req.query
  const { companyId } = session.user as any

  if (req.method === 'PUT') {
    try {
      const updatedItem = await Inventory.findOneAndUpdate(
        { _id: id, companyId },
        req.body,
        { new: true }
      )
      if (!updatedItem) {
        return res.status(404).json({ message: 'Item not found' })
      }
      res.status(200).json({ message: 'Item updated', item: updatedItem })
    } catch (error) {
      res.status(500).json({ message: 'Error updating item', error })
    }
  } else if (req.method === 'DELETE') {
    try {
      const deletedItem = await Inventory.findOneAndDelete({
        _id: id,
        companyId,
      })
      if (!deletedItem) {
        return res.status(404).json({ message: 'Item not found' })
      }
      res.status(200).json({ message: 'Item deleted' })
    } catch (error) {
      res.status(500).json({ message: 'Error deleting item', error })
    }
  } else {
    res.setHeader('Allow', ['PUT', 'DELETE'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
