import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Button } from 'react-bootstrap'
import { ToastContainer, toast } from 'react-toastify'
import { Quote } from '@/types/Quote'
import { Customer } from '@/types/Customer'
import { Price } from '@/types/Price'
import { Company } from '@/types/Company'
import QuoteItemRow from '@/components/app/QuoteItemRow'
import { createQuote } from '@/utils/pdfGenerator'
import styles from '@/styles/QuoteDetails.module.css'

type Props = {
  quote: Quote
  prices: Price
  company: Company
  customer: Customer
  artworkFee: number
  printingFee: number
  setupFee: number
  depositPercentage: number
}

const QuoteDetails = ({
  quote,
  prices,
  company,
  customer,
  artworkFee,
  printingFee,
  setupFee,
  depositPercentage,
}: Props) => {
  // Initialize itemTotals with zeros
  const [itemTotals, setItemTotals] = useState<number[]>(
    quote.items.map(() => 0)
  )
  const [printingOverride, setPrintingOverride] = useState<number | null>(null)
  const [setupOverride, setSetupOverride] = useState<number | null>(null)
  const [shippingOverride, setShippingOverride] = useState<number | null>(null)
  const [depositAmount, setDepositAmount] = useState<number>(0)
  const [salesTaxOverride, setSalesTaxOverride] = useState<number | null>(null)
  const [depositOverride, setDepositOverride] = useState<number | null>(null)
  const [calculatedBalance, setCalculatedBalance] = useState<number>(0)
  const [invoiceTotal, setInvoiceTotal] = useState<number>(0)
  const [newComment, setNewComment] = useState<string>('')

  console.log(quote)
  console.log(prices)

  // Callback to update itemTotals when a row's final total changes
  const handleFinalTotalChange = (index: number, finalTotal: number) => {
    const newItemTotals = [...itemTotals]
    newItemTotals[index] = finalTotal
    setItemTotals(newItemTotals)
  }

  // Calculate total setup fees, including additional fields from quote
  const calculateTotalSetupFees = () => {
    const newScreensFee =
      (quote.screenPrintingDetails?.additionalScreens || 0) *
      parseFloat(prices?.screenPrinting?.perScreenNew || '0')
    const colorChangesFee =
      (quote.screenPrintingDetails?.colorChanges || 0) *
      parseFloat(prices?.artCost?.inkColorChanges || '0')
    const artworkFee = quote.printingDetails.artworkNeeded
      ? parseFloat(prices?.artCost.flatFee || '0')
      : 0
    const colorMatchesFee =
      (quote.printingDetails.colorMatches || 0) *
      parseFloat(prices?.artCost?.colorMatch || '0')
    const hoopingFees =
      (quote.embroideryDetails?.hoopingFeeFront
        ? parseFloat(prices.embroidery?.hoopingFee || '0')
        : 0) +
      (quote.embroideryDetails?.hoopingFeeBack
        ? parseFloat(prices.embroidery?.hoopingFee || '0')
        : 0) +
      (quote.embroideryDetails?.hoopingFeeLeft
        ? parseFloat(prices.embroidery?.hoopingFee || '0')
        : 0) +
      (quote.embroideryDetails?.hoopingFeeRight
        ? parseFloat(prices.embroidery?.hoopingFee || '0')
        : 0)
    const digitizingCost = quote.embroideryDetails?.digitizingCost || 0
    const embroiderySetupFee = quote.embroideryDetails?.setupFee || 0

    return (
      newScreensFee +
      colorChangesFee +
      artworkFee +
      colorMatchesFee +
      hoopingFees +
      digitizingCost +
      embroiderySetupFee
    )
  }

  const totalSetupFees = calculateTotalSetupFees()

  // Calculate shipping cost with override
  const calculateShippingCost = () => {
    const originalShipping = quote.apparelAndShipping?.shippingAndHandling || 0
    return shippingOverride !== null ? shippingOverride : originalShipping
  }

  // Utility function to calculate screen printing fee
  const calculateScreenPrintingFee = () => {
    return printingOverride !== null ? printingOverride : printingFee
  }

  // Calculate subtotal based on itemTotals
  const subtotal =
    itemTotals.reduce((acc, curr) => acc + curr, 0) +
    calculateScreenPrintingFee() +
    calculateShippingCost() // Apply the shipping override

  const tax =
    salesTaxOverride !== null ? salesTaxOverride : quote.summary.taxCost
  const calculatedTotal =
    subtotal + tax + (setupOverride !== null ? setupOverride : totalSetupFees) // Apply Setup Override

  // Calculate deposit amount
  const calculateDepositAmount = useCallback(() => {
    const calculatedDeposit = (calculatedTotal * depositPercentage) / 100
    return depositOverride !== null ? depositOverride : calculatedDeposit
  }, [calculatedTotal, depositPercentage, depositOverride])

  // Update deposit amount, balance, and invoiceTotal when invoice total, deposit percentage, or override changes
  useEffect(() => {
    const depositAmt = calculateDepositAmount()
    setDepositAmount(depositAmt)

    // Update invoice total
    setInvoiceTotal(calculatedTotal)

    // If deposit amount is 0, balance equals the total
    if (depositAmt === 0 || depositOverride === 0) {
      setCalculatedBalance(calculatedTotal)
    } else {
      setCalculatedBalance(calculatedTotal - depositAmt)
    }
  }, [calculatedTotal, depositOverride, itemTotals, calculateDepositAmount])

  const handleAddComment = async () => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/quote/${quote._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: newComment }),
      })

      if (response.ok) {
        const data = await response.json()
        // Update the quote with the new comment
        quote.comments = data.quote.comments
        setNewComment('')
        toast.success('Comment added successfully')
      } else {
        toast.error('Failed to add comment')
      }
    } catch (error) {
      toast.error('Error adding comment')
    }
  }

  // Utility function to conditionally render rows (with price and override)
  const renderConditionalRow = (
    label: string,
    description: string,
    fee: number,
    overrideValue: number | null,
    onOverrideChange: (value: number | null) => void
  ) => {
    const rowTotal = overrideValue !== null ? overrideValue : fee

    if (fee > 0) {
      return (
        <tr>
          <td>
            <strong>{label}</strong>
          </td>
          <td colSpan={4}>{description}</td>
          <td></td>
          <td>${rowTotal.toFixed(2)}</td>
          <td>
            $
            <input
              type="number"
              value={overrideValue ?? ''}
              onChange={(e) =>
                onOverrideChange(e.target.value ? Number(e.target.value) : null)
              }
              style={{ width: '80px' }}
            />
          </td>
        </tr>
      )
    }
    return null
  }

  // Render the setup details based on printingDetails and screenPrintingDetails
  const renderSetupRow = () => {
    const setupDetails = []
    if (quote.printingDetails.artworkNeeded) setupDetails.push('Artwork Needed')
    if (quote.printingDetails.colorMatches > 0)
      setupDetails.push(`Color Matches: ${quote.printingDetails.colorMatches}`)
    if (quote.screenPrintingDetails.additionalScreens > 0)
      setupDetails.push(
        `Additional Screens: ${quote.screenPrintingDetails.additionalScreens}`
      )
    if (quote.screenPrintingDetails.colorChanges > 0)
      setupDetails.push(
        `Color Changes: ${quote.screenPrintingDetails.colorChanges}`
      )
    return setupDetails.join(', ')
  }

  // Utility function to dynamically generate text for printing options
  const buildDecorationText = (printingOptions: any) => {
    let decorationText = ''
    const areas = [
      { label: '(Front)', colors: printingOptions.colorsFront },
      { label: '(Back)', colors: printingOptions.colorsBack },
      { label: '(Left)', colors: printingOptions.colorsLeft },
      { label: '(Right)', colors: printingOptions.colorsRight },
    ]

    areas.forEach((area) => {
      if (area.colors > 0) {
        decorationText += `${area.label} - ${area.colors} Color${
          area.colors > 1 ? 's' : ''
        }, `
      }
    })

    return decorationText.slice(0, -2)
  }

  // Utility function to dynamically generate text for vinyl options
  const buildVinylText = (vinylDetails: any) => {
    let vinylText = ''
    const vinylAreas = [
      {
        label: '(Front)',
        names: vinylDetails.namesFront,
        numbers: vinylDetails.numbersFront,
      },
      {
        label: '(Back)',
        names: vinylDetails.namesBack,
        numbers: vinylDetails.numbersBack,
      },
      {
        label: '(Left)',
        names: vinylDetails.namesLeft,
        numbers: vinylDetails.numbersLeft,
      },
      {
        label: '(Right)',
        names: vinylDetails.namesRight,
        numbers: vinylDetails.numbersRight,
      },
    ]

    vinylAreas.forEach((area) => {
      if (area.names > 0 && area.numbers > 0) {
        vinylText += `${area.label} - Names & Numbers, `
      } else if (area.names > 0) {
        vinylText += `${area.label} - Names, `
      } else if (area.numbers > 0) {
        vinylText += `${area.label} - Numbers, `
      }
    })

    return vinylText.slice(0, -2)
  }

  // Check if Vinyl exists in the quote
  const hasVinyl = () => {
    const vinylDetails = quote.vinylDetails

    return (
      vinylDetails.namesFront > 0 ||
      vinylDetails.numbersFront > 0 ||
      vinylDetails.namesBack > 0 ||
      vinylDetails.numbersBack > 0
    )
  }

  // Render the "Decoration" summary row without price or override fields
  const renderDecorationRow = (description: string) => (
    <tr className={styles.options}>
      <td>
        <strong>Decoration</strong>
      </td>
      <td colSpan={7}>{description}</td>
    </tr>
  )

  // Render the "Vinyl" summary row without price or override fields
  const renderVinylRow = (description: string) => (
    <tr>
      <td>
        <strong>Vinyl</strong>
      </td>
      <td colSpan={7}>{description}</td>
    </tr>
  )

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>{quote.customerName}</h4>
        <h5>Quote Number {quote.quoteId}</h5>
        <p>
          <strong>Contact: </strong> {customer.contactName}
          <br />
          <strong>Address: </strong> {customer.address} {customer.address2},{' '}
          {customer.city}, {customer.state} {customer.zip}
          <br />
          <strong>Phone: </strong> {customer.phone}
          <br />
          <strong>Email: </strong> {customer.email}
        </p>
      </div>

      {/* Quote Items Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th colSpan={2}>DESCRIPTION</th>
            <th>COST</th>
            <th>QUANTITY</th>
            <th>SUBTOTAL</th>
            <th>DISCOUNT</th>
            <th>TOTAL</th>
            <th>OVERRIDE</th>
          </tr>
        </thead>
        <tbody>
          {quote.items.map((item, index) => (
            <QuoteItemRow
              key={index}
              index={index}
              item={item}
              prices={prices}
              onFinalTotalChange={handleFinalTotalChange}
            />
          ))}

          {renderDecorationRow(buildDecorationText(quote.printingOptions))}

          {/* Only render the Vinyl row if vinyl exists */}
          {hasVinyl() && renderVinylRow(buildVinylText(quote.vinylDetails))}

          {renderConditionalRow(
            'Screen Printing',
            '',
            printingFee,
            printingOverride,
            setPrintingOverride
          )}

          {/* Additional Rows */}
          {/* Setup row */}
          {renderConditionalRow(
            'Setup',
            renderSetupRow(),
            totalSetupFees,
            setupOverride,
            setSetupOverride
          )}

          {/* Shipping row */}
          {quote.apparelAndShipping?.shippingAndHandling ? (
            <tr>
              <td>
                <strong>Shipping</strong>
              </td>
              <td colSpan={4}></td>
              <td></td>
              <td>${calculateShippingCost().toFixed(2)}</td>
              <td>
                $
                <input
                  type="number"
                  value={shippingOverride ?? ''}
                  onChange={(e) =>
                    setShippingOverride(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  style={{ width: '80px' }}
                />
              </td>
            </tr>
          ) : null}

          <tr>
            <td>
              <strong>Delivery By</strong>
            </td>
            <td colSpan={7}>
              {new Date(
                quote.printingDetails.deliveryDueDate
              ).toLocaleDateString()}
            </td>
          </tr>

          <tr>
            <td colSpan={5}></td>
            <td>
              <strong>Invoice Subtotal</strong>
            </td>
            <td>${subtotal.toFixed(2)}</td>
          </tr>

          {/* Render Sales Tax with override in the next column */}
          <tr>
            <td colSpan={5}></td>
            <td>
              <strong>Sales Tax</strong>
            </td>
            <td>${tax.toFixed(2)}</td>
            <td>
              $
              <input
                type="number"
                value={salesTaxOverride ?? ''}
                onChange={(e) =>
                  setSalesTaxOverride(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                style={{ width: '80px' }}
              />
            </td>
          </tr>

          <tr>
            <td colSpan={5}></td>
            <td>
              <strong>Invoice Total</strong>
            </td>
            <td>${calculatedTotal.toFixed(2)}</td>
          </tr>

          {/* Render Deposit Due with override */}
          <tr>
            <td colSpan={5}></td>
            <td>
              <strong>Deposit Due ({depositPercentage}%)</strong>
            </td>
            <td>${depositAmount.toFixed(2)}</td>
            <td>
              $
              <input
                type="number"
                value={depositOverride ?? ''}
                onChange={(e) =>
                  setDepositOverride(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                style={{ width: '80px' }}
              />
            </td>
          </tr>

          <tr>
            <td colSpan={5}></td>
            <td>
              <strong>Balance</strong>
            </td>
            <td>${calculatedBalance.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* Comments Section */}
      <div className={styles.commentsSection}>
        <h3>Comments</h3>
        <div className={styles.addComment}>
          <textarea
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className={styles.commentTextarea}
          />
          <Button onClick={handleAddComment} disabled={!newComment.trim()}>
            Add Comment
          </Button>
        </div>
        {quote.comments && quote.comments.length > 0 ? (
          <div className={styles.commentsList}>
            {quote.comments.map((comment, index) => (
              <div key={index} className={styles.comment}>
                <strong>{comment.userName}</strong>{' '}
                <small>{new Date(comment.createdAt).toLocaleString()}</small>
                <p>{comment.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p>No comments yet.</p>
        )}
      </div>

      {/* Modify Quote and Print Buttons */}
      <div className={styles.buttons}>
        <Link href={`/app/quote?quoteId=${quote._id}`}>
          <Button type="button" className="m-4">
            Modify Quote
          </Button>
        </Link>
        <Button
          className="m-4"
          onClick={() => {
            if (quote && company && customer) {
              createQuote(
                quote,
                '',
                artworkFee,
                setupFee,
                '',
                subtotal,
                company,
                customer
              )
            } else {
              toast.error(
                'Cannot print quote: Missing necessary data (quote, company, or customer)'
              )
            }
          }}
        >
          Print Quote
        </Button>
      </div>
      <ToastContainer />
    </div>
  )
}

export default QuoteDetails
