import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/utils/dbConnect'
import Quote from '@/models/Quote'
import Customer from '@/models/Customer'
import { Types } from 'mongoose'
import { generateNextQuoteId } from '@/utils/generateQuoteId'
import { requireAuth, verifyResourceOwnership } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST' && req.method !== 'PUT') {
    console.log(`Invalid request method: ${req.method}`)
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    console.log('Connecting to database...')
    await dbConnect()
    console.log('Database connected successfully.')

    // SECURITY: Require authentication - never trust userId/companyId from request body
    const session = await requireAuth(req, res)
    if (!session) return

    const quoteData = req.body
    console.log('Received quote data')

    // Remove _id if it's an empty string
    if (!quoteData._id) {
      console.log('Removing empty _id from quote data.')
      delete quoteData._id
    }

    // Ensure totalDueDays is set
    if (!quoteData.totalDueDays) {
      const currentDate = new Date()
      const deliveryDueDate = new Date(
        quoteData.printingDetails.deliveryDueDate
      )
      const timeDiff = deliveryDueDate.getTime() - currentDate.getTime()
      quoteData.totalDueDays = Math.max(
        0,
        Math.ceil(timeDiff / (1000 * 3600 * 24))
      )
      console.log(`Calculated totalDueDays: ${quoteData.totalDueDays}`)
    }

    // SECURITY FIX: Use session userId and companyId instead of trusting request body
    const userId = session.user.id
    const companyId = session.user.companyId
    
    console.log(`Authenticated User ID: ${userId}`)
    console.log(`Authenticated Company ID: ${companyId}`)
    
    // Override any userId/companyId from request body with authenticated values
    quoteData.userId = userId
    quoteData.companyId = companyId

    // Handling POST method (Create new quote)
    if (req.method === 'POST') {
      const quoteId = await generateNextQuoteId(companyId)
      quoteData.quoteId = quoteId

      console.log(quoteData)

      const quote = new Quote({
        ...quoteData,
        createdBy: userId,
        quoteId: quoteId,
        companyId: companyId, // Ensure companyId is set from session
      })
      const savedQuote = await quote.save()
      console.log('Quote saved successfully with ID:', savedQuote._id)

      // Create a customer note
      const customerNote = {
        date: new Date(),
        note: `Quote created with ID: ${quoteId}`,
        addedBy: new Types.ObjectId(userId as string),
        addedDate: new Date(),
      }

      console.log(customerNote)

      const customer = await Customer.findById(quoteData.selectedCustomerId)

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' })
      }
      
      // SECURITY: Verify customer belongs to user's company
      if (!verifyResourceOwnership(customer.companyId?.toString(), companyId, res)) {
        return
      }

      // Convert follow-up notes to plain objects and ensure all required fields are present
      customer.followUpNotes = customer.followUpNotes.map((note) => {
        const noteObject = note.toObject ? note.toObject() : note // Convert to plain object if not already
        return {
          ...noteObject,
          addedDate: noteObject.addedDate || new Date(),
          addedBy: noteObject.addedBy || new Types.ObjectId(userId as string),
          date: noteObject.date || new Date(),
        }
      })

      // Add the new customer note
      customer.followUpNotes.push(customerNote as any)
      await customer.save()

      console.log('Customer note saved successfully.')

      res.status(201).json(savedQuote)

      // Handling PUT method (Update existing quote)
    } else if (req.method === 'PUT') {
      const { _id } = quoteData

      if (!_id) {
        return res
          .status(400)
          .json({ message: 'Quote ID is required for updating' })
      }

      // Find the existing quote by _id
      const existingQuote = await Quote.findById(_id)

      if (!existingQuote) {
        return res.status(404).json({ message: 'Quote not found' })
      }

      // SECURITY: Verify quote belongs to user's company before updating
      if (!verifyResourceOwnership(existingQuote.companyId?.toString(), companyId, res)) {
        return
      }

      // Update the quote with the new data, but preserve companyId from session
      Object.assign(existingQuote, quoteData)
      existingQuote.companyId = companyId // Ensure companyId cannot be changed
      existingQuote.ModifiedAt = new Date()

      // Save the updated quote
      const updatedQuote = await existingQuote.save()
      console.log('Quote updated successfully with ID:', updatedQuote._id)

      res.status(200).json(updatedQuote)
    }
  } catch (error) {
    console.error('Failed to handle request:', error)

    if (error instanceof Error) {
      res
        .status(500)
        .json({ message: `Failed to handle request: ${error.message}` })
    } else {
      res
        .status(500)
        .json({ message: 'Failed to handle request due to an unknown error' })
    }
  }
}
