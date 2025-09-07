import { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import dbConnect from '@/utils/dbConnect'
import Inventory from '@/models/Inventory'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req })

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await dbConnect()

  const { companyId } = session.user as any

  if (req.method === 'GET') {
    try {
      const inventory = await Inventory.find({ companyId })
      res.status(200).json({ inventory })
    } catch (error) {
      res.status(500).json({ message: 'Error fetching inventory', error })
    }
  } else if (req.method === 'POST') {
    try {
      const {
        itemName,
        description,
        category,
        quantity,
        minimumStock,
        unitPrice,
        supplier,
        location,
      } = req.body
      const newItem = new Inventory({
        companyId,
        itemName,
        description,
        category,
        quantity,
        minimumStock,
        unitPrice,
        supplier,
        location,
      })
      await newItem.save()
      res.status(201).json({ message: 'Inventory item added', item: newItem })
    } catch (error) {
      res.status(500).json({ message: 'Error adding inventory item', error })
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
