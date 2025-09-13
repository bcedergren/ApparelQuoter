import { QuoteCalculations } from '../quoteCalculations'
import { Quote, QuoteItem } from '@/types/Quote'
import { Price } from '@/types/Price'
import { Company } from '@/types/Company'

describe('Quote Workflow Integration', () => {
  const mockCompany: Company = {
    _id: 'company123',
    name: 'Test Company',
    email: 'test@company.com',
    salesTax: '8.5',
    creditCardCharge: '3.5'
  }

  const mockPrices: Price = {
    _id: 'price123',
    CompanyId: 'company123',
    artCost: {
      firstColor: '10',
      additionalColor: '5',
      flatFee: '25',
      inkMarkup: '2',
      inkChargesPerPiece: '1',
      glitterOrPuff: '3',
      colorMatch: '5',
      inkColorChanges: '2',
      dtgDarkGarmentMarkup: '1.5',
      flashMarkup: '0.5'
    },
    wholesaleMarkup: {
      lessThan: '10',
      betweenStart: '10',
      betweenEnd: '50',
      over: '50',
      markupLessThan: '20',
      markupBetween: '15',
      markupOver: '10',
      andOrLessThan: '1',
      andOrBetween: '2',
      andOrOver: '3'
    },
    printingQuantityRanges: [
      { start: '1', end: '24' },
      { start: '25', end: '99' },
      { start: '100', end: '499' },
      { start: '500', end: '' }
    ],
    printingLocationNames: ['Front', 'Back', 'Left', 'Right'],
    screenPrinting: {
      '1 color': ['0.50', '0.45', '0.40', '0.35'],
      '2 colors': ['0.75', '0.70', '0.65', '0.60'],
      '3 colors': ['1.00', '0.95', '0.90', '0.85'],
      '4 colors': ['1.25', '1.20', '1.15', '1.10'],
      '5 colors': ['1.50', '1.45', '1.40', '1.35'],
      '6 colors': ['1.75', '1.70', '1.65', '1.60'],
      '7 colors': ['2.00', '1.95', '1.90', '1.85'],
      '8 colors': ['2.25', '2.20', '2.15', '2.10'],
      '9 colors': ['2.50', '2.45', '2.40', '2.35'],
      '10 colors': ['2.75', '2.70', '2.65', '2.60'],
      '11 colors': ['3.00', '2.95', '2.90', '2.85'],
      '12 colors': ['3.25', '3.20', '3.15', '3.10'],
      perScreenNew: '15',
      perScreenExisting: '5'
    },
    dyeSublimation: {
      quantity: ['2.00', '1.80', '1.60', '1.40']
    },
    preCutVinyl: {
      names: ['1.50', '1.40', '1.30', '1.20'],
      numbers: ['1.00', '0.90', '0.80', '0.70']
    },
    embroidery: {
      stitchCount: '5000',
      costPerThousandStitches: '0.10',
      hoopingFee: '5.00',
      costPerFirst5000Stitches: '0.15'
    }
  }

  describe('Complete Quote Workflow', () => {
    it('should handle a typical apparel quote with screen printing', () => {
      const quote: Quote = {
        _id: 'quote123',
        companyId: 'company123',
        selectedCustomerId: 'customer123',
        customerName: 'Test Customer',
        quoteType: 'savedQuotes',
        quoteId: 'Q-001',
        items: [{
          brandAndStyle: 'Gildan 5000',
          color: 'Black',
          standardPrice: 3.50,
          sizes: {
            XS: 0, S: 10, M: 20, L: 15, XL: 8,
            '2XL': 5, '3XL': 2, '4XL': 0, '5XL': 0
          },
          sizePrices: {
            '2XL': 4.00,
            '3XL': 4.50,
            '4XL': 5.00,
            '5XL': 5.50
          }
        }],
        embroideryDetails: {
          stitchesFront: 0,
          hoopingFeeFront: false,
          stitchesBack: 0,
          hoopingFeeBack: false,
          stitchesLeft: 0,
          hoopingFeeLeft: false,
          stitchesRight: 0,
          hoopingFeeRight: false,
          digitizingCost: 0,
          setupFee: 0,
          artworkFee: 0
        },
        printingOptions: {
          colorsFront: 2,
          flashFront: false,
          dtgDarkFront: false,
          colorsBack: 1,
          flashBack: false,
          dtgDarkBack: false,
          colorsLeft: 0,
          flashLeft: false,
          dtgDarkLeft: false,
          colorsRight: 0,
          flashRight: false,
          dtgDarkRight: false
        },
        printingDetails: {
          colorMatches: 0,
          artworkNeeded: true,
          deliveryDueDays: 14,
          deliveryDueDate: new Date('2024-02-15')
        },
        apparelAndShipping: {
          customerProvidesApparel: false,
          creditCardCharge: false,
          shippingAndHandling: 15.00,
          shippingAndHandlingTaxed: true
        },
        vinylDetails: {
          namesFront: 0,
          namesBack: 0,
          numbersFront: 0,
          numbersBack: 0
        },
        screenPrintingDetails: {
          newScreensNeeded: true,
          additionalScreens: 2,
          colorChanges: 0,
          inkType: 'Standard'
        },
        summary: {
          qty: 0,
          avgCost: 0,
          apparelCost: 0,
          printingCost: 0,
          shippingCost: 0,
          taxCost: 0,
          totalCost: 0
        },
        depositPercentage: 50,
        totalDueDays: 14,
        CreatedAt: new Date(),
        ModifiedAt: new Date()
      }

      const summary = QuoteCalculations.calculateSummary(quote, mockCompany, mockPrices)

      // Verify basic calculations
      expect(summary.qty).toBe(60) // Total quantity
      expect(summary.apparelCost).toBeGreaterThan(0)
      expect(summary.printingCost).toBeGreaterThan(0)
      expect(summary.shippingCost).toBeGreaterThan(15.00) // Includes tax
      expect(summary.taxCost).toBeGreaterThan(0)
      expect(summary.totalCost).toBeGreaterThan(0)
      expect(summary.avgCost).toBeCloseTo(summary.totalCost / summary.qty, 2)

      // Verify the total cost is reasonable
      expect(summary.totalCost).toBeGreaterThan(summary.apparelCost + summary.printingCost)
    })

    it('should handle a quote with embroidery', () => {
      const embroideryQuote: Quote = {
        _id: 'quote124',
        companyId: 'company123',
        selectedCustomerId: 'customer124',
        customerName: 'Embroidery Customer',
        quoteType: 'savedQuotes',
        quoteId: 'Q-002',
        items: [{
          brandAndStyle: 'Polo Shirt',
          color: 'Navy',
          standardPrice: 8.00,
          sizes: {
            XS: 0, S: 5, M: 10, L: 8, XL: 4,
            '2XL': 3, '3XL': 0, '4XL': 0, '5XL': 0
          }
        }],
        embroideryDetails: {
          stitchesFront: 5000,
          hoopingFeeFront: true,
          stitchesBack: 3000,
          hoopingFeeBack: true,
          stitchesLeft: 0,
          hoopingFeeLeft: false,
          stitchesRight: 0,
          hoopingFeeRight: false,
          digitizingCost: 25.00,
          setupFee: 15.00,
          artworkFee: 10.00
        },
        printingOptions: {
          colorsFront: 0,
          flashFront: false,
          dtgDarkFront: false,
          colorsBack: 0,
          flashBack: false,
          dtgDarkBack: false,
          colorsLeft: 0,
          flashLeft: false,
          dtgDarkLeft: false,
          colorsRight: 0,
          flashRight: false,
          dtgDarkRight: false
        },
        printingDetails: {
          colorMatches: 0,
          artworkNeeded: false,
          deliveryDueDays: 21,
          deliveryDueDate: new Date('2024-02-22')
        },
        apparelAndShipping: {
          customerProvidesApparel: false,
          creditCardCharge: true,
          shippingAndHandling: 12.00,
          shippingAndHandlingTaxed: false
        },
        vinylDetails: {
          namesFront: 0,
          namesBack: 0,
          numbersFront: 0,
          numbersBack: 0
        },
        screenPrintingDetails: {
          newScreensNeeded: false,
          additionalScreens: 0,
          colorChanges: 0,
          inkType: 'Standard'
        },
        summary: {
          qty: 0,
          avgCost: 0,
          apparelCost: 0,
          printingCost: 0,
          shippingCost: 0,
          taxCost: 0,
          totalCost: 0
        },
        depositPercentage: 30,
        totalDueDays: 21,
        CreatedAt: new Date(),
        ModifiedAt: new Date()
      }

      const summary = QuoteCalculations.calculateSummary(embroideryQuote, mockCompany, mockPrices)

      expect(summary.qty).toBe(30)
      expect(summary.apparelCost).toBeGreaterThan(0)
      expect(summary.printingCost).toBeGreaterThan(0) // Should include embroidery costs
      expect(summary.shippingCost).toBe(12.00) // No tax on shipping
      expect(summary.taxCost).toBeGreaterThan(0)
      expect(summary.totalCost).toBeGreaterThan(0)

      // Verify credit card charge is applied
      const expectedBaseTotal = summary.apparelCost + summary.printingCost + summary.shippingCost + summary.taxCost
      const expectedCreditCardFee = expectedBaseTotal * (parseFloat(mockCompany.creditCardCharge) / 100)
      expect(summary.totalCost).toBeCloseTo(expectedBaseTotal + expectedCreditCardFee, 2)
    })

    it('should handle a quote with vinyl printing', () => {
      const vinylQuote: Quote = {
        _id: 'quote125',
        companyId: 'company123',
        selectedCustomerId: 'customer125',
        customerName: 'Vinyl Customer',
        quoteType: 'savedQuotes',
        quoteId: 'Q-003',
        items: [{
          brandAndStyle: 'Hoodie',
          color: 'Gray',
          standardPrice: 12.00,
          sizes: {
            XS: 0, S: 3, M: 5, L: 4, XL: 2,
            '2XL': 1, '3XL': 0, '4XL': 0, '5XL': 0
          }
        }],
        embroideryDetails: {
          stitchesFront: 0,
          hoopingFeeFront: false,
          stitchesBack: 0,
          hoopingFeeBack: false,
          stitchesLeft: 0,
          hoopingFeeLeft: false,
          stitchesRight: 0,
          hoopingFeeRight: false,
          digitizingCost: 0,
          setupFee: 0,
          artworkFee: 0
        },
        printingOptions: {
          colorsFront: 0,
          flashFront: false,
          dtgDarkFront: false,
          colorsBack: 0,
          flashBack: false,
          dtgDarkBack: false,
          colorsLeft: 0,
          flashLeft: false,
          dtgDarkLeft: false,
          colorsRight: 0,
          flashRight: false,
          dtgDarkRight: false
        },
        printingDetails: {
          colorMatches: 0,
          artworkNeeded: false,
          deliveryDueDays: 7,
          deliveryDueDate: new Date('2024-02-08')
        },
        apparelAndShipping: {
          customerProvidesApparel: false,
          creditCardCharge: false,
          shippingAndHandling: 8.00,
          shippingAndHandlingTaxed: true
        },
        vinylDetails: {
          namesFront: 15,
          namesBack: 0,
          numbersFront: 0,
          numbersBack: 0
        },
        screenPrintingDetails: {
          newScreensNeeded: false,
          additionalScreens: 0,
          colorChanges: 0,
          inkType: 'Standard'
        },
        summary: {
          qty: 0,
          avgCost: 0,
          apparelCost: 0,
          printingCost: 0,
          shippingCost: 0,
          taxCost: 0,
          totalCost: 0
        },
        depositPercentage: 50,
        totalDueDays: 7,
        CreatedAt: new Date(),
        ModifiedAt: new Date()
      }

      const summary = QuoteCalculations.calculateSummary(vinylQuote, mockCompany, mockPrices)

      expect(summary.qty).toBe(15)
      expect(summary.apparelCost).toBeGreaterThan(0)
      expect(summary.printingCost).toBeGreaterThan(0) // Should include vinyl costs
      expect(summary.shippingCost).toBeGreaterThan(8.00) // Includes tax
      expect(summary.taxCost).toBeGreaterThan(0)
      expect(summary.totalCost).toBeGreaterThan(0)
    })

    it('should handle a complex quote with multiple printing methods', () => {
      const complexQuote: Quote = {
        _id: 'quote126',
        companyId: 'company123',
        selectedCustomerId: 'customer126',
        customerName: 'Complex Customer',
        quoteType: 'savedQuotes',
        quoteId: 'Q-004',
        items: [{
          brandAndStyle: 'Performance Shirt',
          color: 'White',
          standardPrice: 6.50,
          sizes: {
            XS: 2, S: 8, M: 12, L: 10, XL: 6,
            '2XL': 4, '3XL': 2, '4XL': 1, '5XL': 0
          },
          sizePrices: {
            '2XL': 7.00,
            '3XL': 7.50,
            '4XL': 8.00,
            '5XL': 8.50
          }
        }],
        embroideryDetails: {
          stitchesFront: 3000,
          hoopingFeeFront: true,
          stitchesBack: 0,
          hoopingFeeBack: false,
          stitchesLeft: 0,
          hoopingFeeLeft: false,
          stitchesRight: 0,
          hoopingFeeRight: false,
          digitizingCost: 20.00,
          setupFee: 10.00,
          artworkFee: 5.00
        },
        printingOptions: {
          colorsFront: 3,
          flashFront: true,
          dtgDarkFront: false,
          colorsBack: 1,
          flashBack: false,
          dtgDarkBack: false,
          colorsLeft: 0,
          flashLeft: false,
          dtgDarkLeft: false,
          colorsRight: 0,
          flashRight: false,
          dtgDarkRight: false
        },
        printingDetails: {
          colorMatches: 2,
          artworkNeeded: true,
          deliveryDueDays: 21,
          deliveryDueDate: new Date('2024-02-22')
        },
        apparelAndShipping: {
          customerProvidesApparel: false,
          creditCardCharge: true,
          shippingAndHandling: 20.00,
          shippingAndHandlingTaxed: true
        },
        vinylDetails: {
          namesFront: 0,
          namesBack: 0,
          numbersFront: 45,
          numbersBack: 0
        },
        screenPrintingDetails: {
          newScreensNeeded: true,
          additionalScreens: 3,
          colorChanges: 1,
          inkType: 'Puff'
        },
        summary: {
          qty: 0,
          avgCost: 0,
          apparelCost: 0,
          printingCost: 0,
          shippingCost: 0,
          taxCost: 0,
          totalCost: 0
        },
        depositPercentage: 40,
        totalDueDays: 21,
        CreatedAt: new Date(),
        ModifiedAt: new Date()
      }

      const summary = QuoteCalculations.calculateSummary(complexQuote, mockCompany, mockPrices)

      expect(summary.qty).toBe(45)
      expect(summary.apparelCost).toBeGreaterThan(0)
      expect(summary.printingCost).toBeGreaterThan(0) // Should include all printing costs
      expect(summary.shippingCost).toBeGreaterThan(20.00) // Includes tax
      expect(summary.taxCost).toBeGreaterThan(0)
      expect(summary.totalCost).toBeGreaterThan(0)

      // Verify all costs are reasonable
      expect(summary.apparelCost).toBeGreaterThan(summary.qty * 6.50) // Should be higher due to markup
      expect(summary.printingCost).toBeGreaterThan(0) // Should include screen printing, embroidery, and vinyl
      expect(summary.avgCost).toBeCloseTo(summary.totalCost / summary.qty, 2)
    })
  })

  describe('Error Recovery and Edge Cases', () => {
    it('should handle missing or invalid data gracefully', () => {
      const invalidQuote: Quote = {
        _id: 'quote127',
        companyId: 'company123',
        selectedCustomerId: 'customer127',
        customerName: 'Invalid Customer',
        quoteType: 'savedQuotes',
        quoteId: 'Q-005',
        items: [],
        embroideryDetails: {
          stitchesFront: 0,
          hoopingFeeFront: false,
          stitchesBack: 0,
          hoopingFeeBack: false,
          stitchesLeft: 0,
          hoopingFeeLeft: false,
          stitchesRight: 0,
          hoopingFeeRight: false,
          digitizingCost: 0,
          setupFee: 0,
          artworkFee: 0
        },
        printingOptions: {
          colorsFront: 0,
          flashFront: false,
          dtgDarkFront: false,
          colorsBack: 0,
          flashBack: false,
          dtgDarkBack: false,
          colorsLeft: 0,
          flashLeft: false,
          dtgDarkLeft: false,
          colorsRight: 0,
          flashRight: false,
          dtgDarkRight: false
        },
        printingDetails: {
          colorMatches: 0,
          artworkNeeded: false,
          deliveryDueDays: 0,
          deliveryDueDate: new Date()
        },
        apparelAndShipping: {
          customerProvidesApparel: false,
          creditCardCharge: false,
          shippingAndHandling: 0,
          shippingAndHandlingTaxed: false
        },
        vinylDetails: {
          namesFront: 0,
          namesBack: 0,
          numbersFront: 0,
          numbersBack: 0
        },
        screenPrintingDetails: {
          newScreensNeeded: false,
          additionalScreens: 0,
          colorChanges: 0,
          inkType: 'Standard'
        },
        summary: {
          qty: 0,
          avgCost: 0,
          apparelCost: 0,
          printingCost: 0,
          shippingCost: 0,
          taxCost: 0,
          totalCost: 0
        },
        depositPercentage: 0,
        totalDueDays: 0,
        CreatedAt: new Date(),
        ModifiedAt: new Date()
      }

      const summary = QuoteCalculations.calculateSummary(invalidQuote, mockCompany, mockPrices)

      expect(summary.qty).toBe(0)
      expect(summary.apparelCost).toBe(0)
      expect(summary.printingCost).toBe(0)
      expect(summary.shippingCost).toBe(0)
      expect(summary.taxCost).toBe(0)
      expect(summary.totalCost).toBe(0)
      expect(summary.avgCost).toBe(0)
    })

    it('should handle null prices gracefully', () => {
      const quote: Quote = {
        _id: 'quote128',
        companyId: 'company123',
        selectedCustomerId: 'customer128',
        customerName: 'No Prices Customer',
        quoteType: 'savedQuotes',
        quoteId: 'Q-006',
        items: [{
          brandAndStyle: 'Test Shirt',
          color: 'Blue',
          standardPrice: 5.00,
          sizes: {
            XS: 0, S: 5, M: 5, L: 0, XL: 0,
            '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0
          }
        }],
        embroideryDetails: {
          stitchesFront: 0,
          hoopingFeeFront: false,
          stitchesBack: 0,
          hoopingFeeBack: false,
          stitchesLeft: 0,
          hoopingFeeLeft: false,
          stitchesRight: 0,
          hoopingFeeRight: false,
          digitizingCost: 0,
          setupFee: 0,
          artworkFee: 0
        },
        printingOptions: {
          colorsFront: 1,
          flashFront: false,
          dtgDarkFront: false,
          colorsBack: 0,
          flashBack: false,
          dtgDarkBack: false,
          colorsLeft: 0,
          flashLeft: false,
          dtgDarkLeft: false,
          colorsRight: 0,
          flashRight: false,
          dtgDarkRight: false
        },
        printingDetails: {
          colorMatches: 0,
          artworkNeeded: false,
          deliveryDueDays: 7,
          deliveryDueDate: new Date('2024-02-08')
        },
        apparelAndShipping: {
          customerProvidesApparel: false,
          creditCardCharge: false,
          shippingAndHandling: 5.00,
          shippingAndHandlingTaxed: false
        },
        vinylDetails: {
          namesFront: 0,
          namesBack: 0,
          numbersFront: 0,
          numbersBack: 0
        },
        screenPrintingDetails: {
          newScreensNeeded: false,
          additionalScreens: 0,
          colorChanges: 0,
          inkType: 'Standard'
        },
        summary: {
          qty: 0,
          avgCost: 0,
          apparelCost: 0,
          printingCost: 0,
          shippingCost: 0,
          taxCost: 0,
          totalCost: 0
        },
        depositPercentage: 50,
        totalDueDays: 7,
        CreatedAt: new Date(),
        ModifiedAt: new Date()
      }

      const summary = QuoteCalculations.calculateSummary(quote, mockCompany, null)

      expect(summary.qty).toBe(0)
      expect(summary.apparelCost).toBe(0)
      expect(summary.printingCost).toBe(0)
      expect(summary.shippingCost).toBe(0)
      expect(summary.taxCost).toBe(0)
      expect(summary.totalCost).toBe(0)
      expect(summary.avgCost).toBe(0)
    })
  })
})
