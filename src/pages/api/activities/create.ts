import type { NextApiRequest } from 'next'
import dbConnect from '@/utils/dbConnect'
import Activity from '@/models/Activity'
import Quote from '@/models/Quote'
import User from '@/models/User'
import { requireAuth, verifyResourceOwnership } from '@/lib/auth'

export default async function handler(req: NextApiRequest, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  // SECURITY: Require authentication
  const session = await requireAuth(req, res);
  if (!session) return;

  try {
    await dbConnect()

    const { orderId, activityType } = req.body

    // Fetch the order number from the Quote model (assuming orderId corresponds to a quote)
    const quote = await Quote.findById(orderId)
    if (!quote) {
      return res.status(404).json({ message: 'Order not found' })
    }

    // SECURITY: Verify quote belongs to user's company
    if (!verifyResourceOwnership(quote.companyId?.toString(), session.user.companyId, res)) {
      return;
    }

    // SECURITY: Use session data instead of request body
    const companyId = session.user.companyId;
    const updatedBy = session.user.id;

    // Fetch the user's name using the session userId
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
