import type { NextApiRequest, NextApiResponse } from 'next'
import { getSession } from 'next-auth/react'
import mongoose from 'mongoose'
import dbConnect from '@/utils/dbConnect'
import Invoice from '@/models/Invoice'
import Customer from '@/models/Customer'
import Company from '@/models/Company'
import { generateInvoicePDF } from '@/utils/invoicePdfGenerator'

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

    const invoice: any = await Invoice.findOne({
      _id: new mongoose.Types.ObjectId(invoiceId),
      companyId: new mongoose.Types.ObjectId(companyId),
    })
      .populate('customerId', 'email contactName companyName')
      .populate('createdBy', 'firstName lastName email')
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

    const company = await Company.findById(companyId).lean()

    const invoiceUrl = `${baseUrl}/app/invoices/${invoice._id}`
    const recipientName = customer.contactName || customer.companyName || 'Customer'
    const totalAmount = Number((invoice as any).totalAmount || 0)
    const formattedTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount)
    const invoiceDateStr = new Date((invoice as any).invoiceDate).toLocaleDateString()
    const dueDateStr = new Date((invoice as any).dueDate).toLocaleDateString()
    const companyName = (company as any)?.name || 'Your Company'
    const companyEmail = (company as any)?.email || process.env.CONTACT_EMAIL || ''
    const companyPhone = (company as any)?.phone || ''
    const companyAddressLine1 = (company as any)?.streetAddress || ''
    const companyCity = (company as any)?.city || ''
    const companyState = (company as any)?.state || ''
    const companyZip = (company as any)?.zip || ''

    const subject = `Invoice ${(invoice as any).invoiceNumber} from ${companyName} — ${formattedTotal} due by ${dueDateStr}`

    const html = `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f7f8fa;font-family:Helvetica,Arial,sans-serif;color:#222;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f7f8fa;padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e9ecef;">
            <tr>
              <td style="background:#2c3e50;color:#fff;padding:20px 24px;font-size:18px;font-weight:600;">
                ${companyName}
              </td>
            </tr>
            <tr>
              <td style="padding:24px;">
                <h1 style="margin:0 0 8px;font-size:20px;color:#111;">Invoice ${(invoice as any).invoiceNumber}</h1>
                <p style="margin:0 0 16px;color:#555;">Hello ${recipientName},</p>
                <p style="margin:0 0 16px;color:#555;">
                  Your invoice is ready. The total due is
                  <strong>${formattedTotal}</strong> by <strong>${dueDateStr}</strong>.
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 24px;">
                  <tr>
                    <td style="background:#2c3e50;padding:12px 18px;border-radius:6px;">
                      <a href="${invoiceUrl}" target="_blank" style="color:#fff;text-decoration:none;font-weight:600;">
                        View or Download Invoice
                      </a>
                    </td>
                  </tr>
                </table>

                <p style="margin:0 0 8px;color:#555;">Billing summary</p>
                <ul style="margin:0 0 16px;color:#555;padding-left:18px;">
                  <li>Invoice #: ${(invoice as any).invoiceNumber}</li>
                  <li>Issue date: ${invoiceDateStr}</li>
                  <li>Due date: ${dueDateStr}</li>
                </ul>

                <p style="margin:0 0 16px;color:#555;">
                  If you have any questions or need assistance, just reply to this email or contact us at ${companyEmail}.
                </p>
                <p style="margin:0;color:#555;">Thank you for your business!</p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 24px;background:#f1f3f5;color:#6c757d;font-size:12px;">
                ${companyName} • ${companyAddressLine1} • ${companyCity}, ${companyState} ${companyZip} • ${companyPhone}
              </td>
            </tr>
          </table>
          <div style="color:#8a8f98;font-size:11px;margin-top:12px;">You’re receiving this email because you are a customer of ${companyName}.</div>
        </td>
      </tr>
    </table>
  </body>
  </html>`

    const text = `Hello ${recipientName},\n\nYour invoice ${(invoice as any).invoiceNumber} from ${companyName} is ready.\nTotal due: ${formattedTotal}\nDue date: ${dueDateStr}\n\nView or download your invoice:\n${invoiceUrl}\n\nIf you have any questions, reply to this email or contact us at ${companyEmail}.\nThank you for your business!`

    // Generate PDF attachment
    let attachments: Array<{ filename: string; content: string; type?: string }> | undefined
    if (company) {
      try {
        // generate PDF on server and get base64
        const doc = generateInvoicePDF({ invoice: invoice as any, customer, company: company as any })
        const pdfBase64 = (doc as any).output('datauristring') as string
        const base64Content = pdfBase64.split(',')[1]
        attachments = [
          {
            filename: `invoice-${(invoice as any).invoiceNumber}.pdf`,
            content: base64Content,
            type: 'application/pdf',
          },
        ]
      } catch (e) {
        console.warn('Failed to generate PDF attachment, sending email without attachment', e)
      }
    }

    const mailerUrl = `${baseUrl}/api/mailer`
    const sendResp = await fetch(mailerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.CONTACT_EMAIL,
        to: customer.email,
        subject,
        html,
        text,
        attachments,
      }),
    })

    if (!sendResp.ok) {
      const errorText = await sendResp.text()
      return res
        .status(502)
        .json({ message: 'Failed to send invoice email', details: errorText })
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


