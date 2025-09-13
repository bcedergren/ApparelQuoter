import { QuoteCalculations } from '../quoteCalculations'
import { Quote, QuoteItem } from '@/types/Quote'
import { Price } from '@/types/Price'
import { Company } from '@/types/Company'

describe('QuoteCalculations', () => {
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

  const mockQuoteItem: QuoteItem = {
    brandAndStyle: 'Test T-Shirt',
    color: 'Black',
    standardPrice: 5.00,
    sizes: {
      XS: 0,
      S: 5,
      M: 10,
      L: 8,
      XL: 3,
      '2XL': 2,
      '3XL': 1,
      '4XL': 0,
      '5XL': 0
    },
    sizePrices: {
      '2XL': 5.50,
      '3XL': 6.00,
      '4XL': 6.50,
      '5XL': 7.00
    }
  }

  const mockQuote: Quote = {
    _id: 'quote123',
    companyId: 'company123',
    selectedCustomerId: 'customer123',
    customerName: 'Test Customer',
    quoteType: 'savedQuotes',
    quoteId: 'Q-001',
    items: [mockQuoteItem],
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
      deliveryDueDate: new Date('2024-02-01')
    },
    apparelAndShipping: {
      customerProvidesApparel: false,
      creditCardCharge: false,
      shippingAndHandling: 10.00,
      shippingAndHandlingTaxed: true
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

  describe('calculateSummary', () => {
    it('should calculate correct summary with valid data', () => {
      const summary = QuoteCalculations.calculateSummary(mockQuote, mockCompany, mockPrices)
      
      expect(summary.qty).toBe(29) // Total quantity from all sizes
      expect(summary.apparelCost).toBeGreaterThan(0)
      expect(summary.printingCost).toBeGreaterThan(0)
      // 10.00 + (10.00 * 0.085) = 10.85
      expect(summary.shippingCost).toBeCloseTo(10.85, 1) // 10.00 + 8.5% tax
      expect(summary.taxCost).toBeGreaterThan(0)
      expect(summary.totalCost).toBeGreaterThan(0)
      expect(summary.avgCost).toBe(summary.totalCost / summary.qty)
    })

    it('should handle null prices gracefully', () => {
      const summary = QuoteCalculations.calculateSummary(mockQuote, mockCompany, null)
      
      expect(summary.qty).toBe(0)
      expect(summary.avgCost).toBe(0)
      expect(summary.apparelCost).toBe(0)
      expect(summary.printingCost).toBe(0)
      expect(summary.shippingCost).toBe(0)
      expect(summary.taxCost).toBe(0)
      expect(summary.totalCost).toBe(0)
    })

    it('should handle empty quote items', () => {
      const emptyQuote = { ...mockQuote, items: [] }
      const summary = QuoteCalculations.calculateSummary(emptyQuote, mockCompany, mockPrices)
      
      expect(summary.qty).toBe(0)
      expect(summary.apparelCost).toBe(0)
      expect(summary.avgCost).toBe(0)
    })
  })

  describe('calculateApparelCost', () => {
    it('should calculate correct apparel cost with markup', () => {
      const apparelCost = QuoteCalculations.calculateApparelCost(mockQuote, mockPrices)
      
      // Should be greater than base cost due to markup
      expect(apparelCost).toBeGreaterThan(0)
    })

    it('should handle items with zero quantities', () => {
      const zeroQuantityItem = {
        ...mockQuoteItem,
        sizes: {
          XS: 0, S: 0, M: 0, L: 0, XL: 0,
          '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0
        }
      }
      const quoteWithZeroItems = { ...mockQuote, items: [zeroQuantityItem] }
      const apparelCost = QuoteCalculations.calculateApparelCost(quoteWithZeroItems, mockPrices)
      
      expect(apparelCost).toBe(0)
    })
  })

  describe('calculateBaseItemCost', () => {
    it('should calculate correct base cost per item', () => {
      const itemQuantity = 29 // Total quantity
      const baseCost = QuoteCalculations.calculateBaseItemCost(mockQuoteItem, itemQuantity, mockPrices)
      
      expect(baseCost).toBeGreaterThan(0)
      expect(typeof baseCost).toBe('number')
    })

    it('should handle zero item quantity gracefully', () => {
      const baseCost = QuoteCalculations.calculateBaseItemCost(mockQuoteItem, 0, mockPrices)
      
      expect(baseCost).toBe(0)
    })
  })

  describe('calculatePrintingCost', () => {
    it('should calculate correct printing cost', () => {
      const printingCost = QuoteCalculations.calculatePrintingCost(mockQuote, mockPrices)
      
      expect(printingCost).toBeGreaterThan(0)
    })

    it('should handle zero color counts', () => {
      const zeroColorQuote = {
        ...mockQuote,
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
        }
      }
      const printingCost = QuoteCalculations.calculatePrintingCost(zeroColorQuote, mockPrices)
      
      expect(printingCost).toBe(0)
    })
  })

  describe('calculateTaxCost', () => {
    it('should calculate correct tax cost', () => {
      const apparelCost = 100
      const printingCost = 50
      const baseShippingCost = 10
      const taxCost = QuoteCalculations.calculateTaxCost(
        mockQuote,
        mockCompany,
        apparelCost,
        printingCost,
        baseShippingCost
      )
      
      // Tax should be calculated on apparel + printing + shipping (since shippingAndHandlingTaxed is true)
      const expectedTaxableAmount = apparelCost + printingCost + baseShippingCost
      const expectedTax = expectedTaxableAmount * (parseInt(mockCompany.salesTax) / 100)
      
      expect(taxCost).toBeCloseTo(expectedTax, 2)
    })

    it('should handle non-taxed shipping', () => {
      const nonTaxedQuote = {
        ...mockQuote,
        apparelAndShipping: {
          ...mockQuote.apparelAndShipping,
          shippingAndHandlingTaxed: false
        }
      }
      
      const apparelCost = 100
      const printingCost = 50
      const baseShippingCost = 10
      const taxCost = QuoteCalculations.calculateTaxCost(
        nonTaxedQuote,
        mockCompany,
        apparelCost,
        printingCost,
        baseShippingCost
      )
      
      // Tax should only be calculated on apparel + printing
      const expectedTaxableAmount = apparelCost + printingCost
      const expectedTax = expectedTaxableAmount * (parseInt(mockCompany.salesTax) / 100)
      
      expect(taxCost).toBeCloseTo(expectedTax, 2)
    })
  })

  describe('getTotalQuantity', () => {
    it('should calculate correct total quantity', () => {
      const totalQty = QuoteCalculations.getTotalQuantity(mockQuote)
      
      expect(totalQty).toBe(29) // 5 + 10 + 8 + 3 + 2 + 1
    })

    it('should handle empty items array', () => {
      const emptyQuote = { ...mockQuote, items: [] }
      const totalQty = QuoteCalculations.getTotalQuantity(emptyQuote)
      
      expect(totalQty).toBe(0)
    })
  })

  describe('getQuantityTier', () => {
    it('should return correct quantity tier', () => {
      const tier = QuoteCalculations.getQuantityTier(mockQuote, mockPrices)
      
      // With 29 items, should be in tier 1 (25-99 range)
      expect(tier).toBe(1)
    })

    it('should handle quantities outside ranges', () => {
      const highQuantityQuote = {
        ...mockQuote,
        items: [{
          ...mockQuoteItem,
          sizes: {
            XS: 0, S: 0, M: 0, L: 0, XL: 0,
            '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 1000
          }
        }]
      }
      
      const tier = QuoteCalculations.getQuantityTier(highQuantityQuote, mockPrices)
      
      // Should return the last tier (3) for quantities in the highest range (500+)
      expect(tier).toBe(3)
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle invalid numeric values gracefully', () => {
      const invalidCompany = {
        ...mockCompany,
        salesTax: 'invalid',
        creditCardCharge: 'invalid'
      }
      
      const summary = QuoteCalculations.calculateSummary(mockQuote, invalidCompany, mockPrices)
      
      // Should not throw error and should handle gracefully
      expect(summary).toBeDefined()
      expect(typeof summary.totalCost).toBe('number')
    })

    it('should handle missing price data gracefully', () => {
      const incompletePrices = {
        ...mockPrices,
        screenPrinting: {
          ...mockPrices.screenPrinting,
          '1 color': [] // Empty array
        }
      }
      
      const summary = QuoteCalculations.calculateSummary(mockQuote, mockCompany, incompletePrices)
      
      expect(summary).toBeDefined()
      expect(typeof summary.printingCost).toBe('number')
    })

    it('should handle negative quantities', () => {
      const negativeQuantityItem = {
        ...mockQuoteItem,
        sizes: {
          XS: -5, S: 10, M: 0, L: 0, XL: 0,
          '2XL': 0, '3XL': 0, '4XL': 0, '5XL': 0
        }
      }
      
      const quoteWithNegative = { ...mockQuote, items: [negativeQuantityItem] }
      const summary = QuoteCalculations.calculateSummary(quoteWithNegative, mockCompany, mockPrices)
      
      // Should handle negative quantities gracefully
      expect(summary).toBeDefined()
      expect(summary.qty).toBe(10) // Should only count positive quantities
    })
  })
})
