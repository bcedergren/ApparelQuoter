import type { NextApiRequest } from 'next'
import dbConnect from '@/utils/dbConnect'
import Activity from '@/models/Activity'
import Quote from '@/models/Quote'
import User from '@/models/User'

export default async function handler(req: NextApiRequest, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    await dbConnect()

    const { orderId, companyId, updatedBy, activityType } = req.body

    // Fetch the order number from the Quote model (assuming orderId corresponds to a quote)
    const quote = await Quote.findById(orderId)
    if (!quote) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // Fetch the user's name using the updatedBy ID
    const user = await User.findById(updatedBy)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    const orderNumber = quote.quoteId // Assuming quoteId is the order number
    const userName = `${user.firstName} ${user.lastName}`

    // Construct the activity message
    const message = `Order ${orderNumber} status changed to ${activityType} by ${userName}`

    // Create the activity record
    const newActivity = new Activity({
      orderId,
      companyId,
      updatedBy,
      activityType,
      message,
      timestamp: new Date(),
    })

    const savedActivity = await newActivity.save()

    res.status(201).json(savedActivity)
  } catch (error) {
    console.error('Error creating activity record:', error)
    res.status(500).json({ message: 'Failed to create activity record' })
  }
}
