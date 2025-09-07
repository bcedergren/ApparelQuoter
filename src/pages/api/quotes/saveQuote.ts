import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '@/utils/dbConnect'
import Quote from '@/models/Quote'
import Customer from '@/models/Customer'
import { Types } from 'mongoose'
import { generateNextQuoteId } from '@/utils/generateQuoteId'

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

    // Add userId to the quoteData
    const userId = quoteData.userId
    if (!userId) {
      const errorMessage = 'User ID is required to save the quote'
      console.error(errorMessage)
      throw new Error(errorMessage)
    }
    console.log(`User ID: ${userId}`)

    // Handling POST method (Create new quote)
    if (req.method === 'POST') {
      const quoteId = await generateNextQuoteId(quoteData.companyId)
      quoteData.quoteId = quoteId

      console.log(quoteData)

      const quote = new Quote({
        ...quoteData,
        createdBy: userId,
        quoteId: quoteId,
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

      // Update the quote with the new data
      Object.assign(existingQuote, quoteData)
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
