import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import mongoose from 'mongoose'
import dbConnect from '@/utils/dbConnect'
import Invoice from '@/models/Invoice'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  const session = await getSession({ req })
  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' })
  }

  const { invoiceId } = req.query
  if (
    !invoiceId ||
    typeof invoiceId !== 'string' ||
    !mongoose.Types.ObjectId.isValid(invoiceId)
  ) {
    return res.status(400).json({ message: 'Invalid invoice ID' })
  }

  try {
    await dbConnect()

    const companyId = (session.user as any).companyId

    const invoice = await Invoice.findOne({
      _id: new mongoose.Types.ObjectId(invoiceId),
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .populate('customerId', 'email contactName companyName')
      .lean()

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' })
    }

    const customer: any = invoice.customerId
    if (!customer?.email) {
      return res.status(400).json({ message: 'Customer email not available' })
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
    if (!baseUrl) {
      return res.status(500).json({ message: 'Base URL is not configured' })
    }

    const invoiceUrl = `${baseUrl}/app/invoices/${invoice._id}`
    const subject = `Invoice ${invoice.invoiceNumber} from ApparelQuoter`
    const recipientName = customer.contactName || customer.companyName || 'Customer'
    const totalAmount = Number((invoice as any).totalAmount || 0)
    const html = `
      <p>Hello ${recipientName},</p>
      <p>You have a new invoice: <strong>${(invoice as any).invoiceNumber}</strong>.</p>
      <p>Total Amount: <strong>$${totalAmount.toFixed(2)}</strong></p>
      <p>You can view or download your invoice here:</p>
      <p><a href="${invoiceUrl}" target="_blank" rel="noopener noreferrer">${invoiceUrl}</a></p>
      <p>Thank you!</p>
    `

    const mailerUrl = `${baseUrl}/api/mailer`
    const sendResp = await fetch(mailerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_EMAIL,
        to: customer.email,
        subject,
        html,
      }),
    })

    if (!sendResp.ok) {
      const text = await sendResp.text()
      return res
        .status(502)
        .json({ message: 'Failed to send invoice email', details: text })
    }

    await Invoice.findByIdAndUpdate(
      invoiceId,
      { status: 'sent', sentDate: new Date() },
      { new: true }
    )

    return res
      .status(200)
      .json({ message: 'Invoice emailed and marked as sent' })
  } catch (err) {
    console.error('Error sending invoice:', err)
    return res.status(500).json({ message: 'Failed to send invoice' })
  }
}


