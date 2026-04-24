import { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/pages/api/auth/[...nextauth]'
import dbConnect from '@/utils/dbConnect'
import Quote from '@/models/Quote'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions)

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  await dbConnect()

  const { quoteId } = req.query
  const { comment } = req.body

  if (req.method === 'POST') {
    try {
      const newComment = {
        userId: session.user.id,
        userName: session.user.name || 'Unknown User',
        comment,
        createdAt: new Date(),
      }

      const updatedQuote = await Quote.findByIdAndUpdate(
        quoteId,
        { $push: { comments: newComment } },
        { new: true }
      )

      if (!updatedQuote) {
        return res.status(404).json({ message: 'Quote not found' })
      }

      res.status(200).json({ message: 'Comment added', quote: updatedQuote })
    } catch (error) {
      res.status(500).json({ message: 'Error adding comment', error })
    }
  } else {
    res.setHeader('Allow', ['POST'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
