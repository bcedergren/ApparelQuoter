/* The QuoteCalculations class in TypeScript provides methods to calculate various costs and summary
details for a quote based on item quantities, pricing, and company information. */
import { Quote, QuoteItem } from '@/types/Quote'
import {
  Price,
  ScreenPrinting,
  PreCutVinyl,
  Embroidery,
  ArtCost,
} from '@/types/Price'
import { Summary } from '@/types/Quote'
import { Company } from '@/types/Company'

export class QuoteCalculations {
  static calculateSummary(
    quote: Quote,
    company: Company,
    prices: Price | null
  ): Summary {
    if (!prices) {
      return {
        qty: 0,
        avgCost: 0,
        apparelCost: 0,
        printingCost: 0,
        shippingCost: 0,
        taxCost: 0,
        totalCost: 0,
      }
    }

    const qty = this.getTotalQuantity(quote)
    const apparelCost = this.calculateApparelCost(quote, prices)
    const printingCost = this.calculatePrintingCost(quote, prices)
    const baseShippingCost = Number(
      quote.apparelAndShipping.shippingAndHandling || 0
    )

    const taxCost = this.calculateTaxCost(
      quote,
      company,
      apparelCost,
      printingCost,
      baseShippingCost
    )

    let shippingCost = baseShippingCost

    // Add tax to shipping if "S&H Taxed" is true
    if (quote.apparelAndShipping.shippingAndHandlingTaxed) {
      const shippingTax = baseShippingCost * (parseInt(company.salesTax) / 100)
      shippingCost += shippingTax
    }

    let totalCost = apparelCost + printingCost + shippingCost + taxCost

    // Apply Credit Card Charge if applicable
    if (quote.apparelAndShipping.creditCardCharge) {
      const creditCardChargeRate = parseFloat(company.creditCardCharge || '0')
      const creditCardFee = totalCost * (creditCardChargeRate / 100)
      totalCost += creditCardFee
    }

    const avgCost = qty > 0 ? totalCost / qty : 0

    return {
      qty,
      avgCost,
      apparelCost,
      printingCost,
      shippingCost,
      taxCost,
      totalCost,
    }
  }

  static calculateApparelCost(quote: Quote, prices: Price): number {
    return quote.items.reduce((sum, item) => {
      let totalItemCost = 0

      Object.keys(item.sizes).forEach((sizeKey) => {
        const qtyForSize = item.sizes[sizeKey as keyof typeof item.sizes] || 0
        if (qtyForSize > 0) {
          let sizeCost = item.standardPrice

          // Check for special pricing for extended sizes
          if (
            ['2XL', '3XL', '4XL', '5XL'].includes(sizeKey) &&
            item.sizePrices?.[sizeKey]
          ) {
            sizeCost = item.sizePrices[sizeKey]
          }

          // Apply markup to the base price
          const markupAmount = this.applyMarkup(sizeCost, prices)
          const finalSizeCost = sizeCost + markupAmount

          totalItemCost += finalSizeCost * qtyForSize
        }
      })

      return sum + totalItemCost
    }, 0)
  }

  static calculateBaseItemCost(
    item: QuoteItem,
    itemQuantity: number,
    prices: Price
  ): number {
    const { sizes, standardPrice, sizePrices } = item
    let totalBaseCost = 0

    // Declare the sizes arrays with explicit types
    const standardSizes: Array<keyof typeof sizes> = ['XS', 'S', 'M', 'L', 'XL']
    const extendedSizes: Array<keyof typeof sizes> = [
      '2XL',
      '3XL',
      '4XL',
      '5XL',
    ]

    // Calculate the base cost for standard sizes
    standardSizes.forEach((size) => {
      const qtyForSize = sizes[size] || 0

      if (qtyForSize === 0) return

      let sizeCost = standardPrice
      const sizeCostWithMarkup = this.applyMarkup(sizeCost, prices)
      totalBaseCost += qtyForSize * sizeCostWithMarkup
    })

    // Calculate the base cost for extended sizes
    extendedSizes.forEach((size) => {
      const qtyForSize = sizes[size] || 0

      if (qtyForSize === 0) return

      let sizeCost = sizePrices?.[size] ?? standardPrice
      const sizeCostWithMarkup = this.applyMarkup(sizeCost, prices)
      totalBaseCost += qtyForSize * sizeCostWithMarkup
    })

    const baseCostPerItem = itemQuantity > 0 ? totalBaseCost / itemQuantity : 0
    return baseCostPerItem
  }

  static calculatePrintingCost(quote: Quote, prices: Price): number {
    let printingCost = 0

    // Screen Printing Cost
    printingCost += this.calculateScreenPrintingCost(quote, prices)

    // Embroidery Cost
    printingCost += this.calculateEmbroideryCost(quote, prices)

    // Vinyl Cost
    printingCost += this.calculateVinylCost(quote, prices)

    return printingCost
  }

  static calculateScreenPrintingCost(quote: Quote, prices: Price): number {
    let screenPrintingCost = 0
    const totalQuantity = this.getTotalQuantity(quote)

    Object.keys(quote.printingOptions).forEach((location) => {
      const colorCount =
        quote.printingOptions[location as keyof typeof quote.printingOptions]

      if (
        typeof colorCount === 'number' &&
        colorCount > 0 &&
        colorCount <= 12
      ) {
        const colorKey = `${colorCount} color${
          colorCount > 1 ? 's' : ''
        }` as keyof ScreenPrinting
        const quantityTier = this.getQuantityTier(quote, prices)

        if (
          prices.screenPrinting[colorKey] &&
          quantityTier >= 0 &&
          quantityTier < prices.screenPrinting[colorKey].length
        ) {
          const colorCost = parseFloat(
            prices.screenPrinting[colorKey][quantityTier]
          )
          if (!isNaN(colorCost)) {
            screenPrintingCost += colorCost * totalQuantity
          }
        }

        // Apply Flash Markup if enabled for this location
        const flashKey = `flash${location.replace(
          'colors',
          ''
        )}` as keyof typeof quote.printingOptions
        if (quote.printingOptions[flashKey]) {
          const flashCost =
            parseFloat(prices.artCost?.flashMarkup || '0') * totalQuantity
          screenPrintingCost += flashCost
        }

        // Apply DTG Dark Garment Markup if enabled for this location
        const dtgDarkKey = `dtgDark${location.replace(
          'colors',
          ''
        )}` as keyof typeof quote.printingOptions
        if (quote.printingOptions[dtgDarkKey]) {
          const dtgDarkCost =
            parseFloat(prices.artCost?.dtgDarkGarmentMarkup || '0') *
            totalQuantity
          screenPrintingCost += dtgDarkCost
        }
      }
    })

    // Add costs for new screens
    if (quote.screenPrintingDetails.newScreensNeeded) {
      const newScreenCost = parseFloat(
        prices.screenPrinting?.perScreenNew || '0'
      )
      screenPrintingCost +=
        quote.screenPrintingDetails.additionalScreens * newScreenCost
    }

    // Add artwork costs
    if (quote.printingDetails.artworkNeeded) {
      screenPrintingCost += parseFloat(prices.artCost?.flatFee || '0')
    }

    return screenPrintingCost
  }

  static calculateEmbroideryCost(quote: Quote, prices: Price): number {
    let embroideryCost = 0
    if (quote.embroideryDetails) {
      const costPerThousandStitches = parseFloat(
        prices.embroidery?.costPerThousandStitches || '0'
      )
      const hoopingFee = parseFloat(prices.embroidery?.hoopingFee || '0')

      // Calculate stitch costs for all locations
      const stitchLocations = [
        {
          stitches: quote.embroideryDetails.stitchesFront,
          hooping: quote.embroideryDetails.hoopingFeeFront,
        },
        {
          stitches: quote.embroideryDetails.stitchesBack,
          hooping: quote.embroideryDetails.hoopingFeeBack,
        },
        {
          stitches: quote.embroideryDetails.stitchesLeft,
          hooping: quote.embroideryDetails.hoopingFeeLeft,
        },
        {
          stitches: quote.embroideryDetails.stitchesRight,
          hooping: quote.embroideryDetails.hoopingFeeRight,
        },
      ]

      stitchLocations.forEach(({ stitches, hooping }) => {
        if (stitches > 0) {
          embroideryCost += (stitches / 1000) * costPerThousandStitches
        }
        if (hooping) {
          embroideryCost += hoopingFee
        }
      })

      // Add digitizing and setup costs
      embroideryCost += quote.embroideryDetails.digitizingCost || 0
      embroideryCost += quote.embroideryDetails.setupFee || 0
      embroideryCost += quote.embroideryDetails.artworkFee || 0
    }
    return embroideryCost
  }

  static calculateVinylCost(quote: Quote, prices: Price): number {
    let vinylCost = 0
    if (quote.vinylDetails) {
      const namePrice = parseFloat(prices.preCutVinyl?.names[0] || '0')
      const numberPrice = parseFloat(prices.preCutVinyl?.numbers[0] || '0')

      // Calculate costs for all locations
      vinylCost += quote.vinylDetails.namesFront * namePrice
      vinylCost += quote.vinylDetails.namesBack * namePrice
      vinylCost += quote.vinylDetails.numbersFront * numberPrice
      vinylCost += quote.vinylDetails.numbersBack * numberPrice
    }
    return vinylCost
  }

  static calculateTaxCost(
    quote: Quote,
    company: Company,
    apparelCost: number,
    printingCost: number,
    baseShippingCost: number
  ): number {
    const taxableAmount = apparelCost + printingCost
    const totalTaxableAmount = quote.apparelAndShipping.shippingAndHandlingTaxed
      ? taxableAmount + baseShippingCost
      : taxableAmount
    return totalTaxableAmount * (parseInt(company.salesTax) / 100)
  }

  static applyMarkup(basePrice: number, prices: Price): number {
    let markupPercentage = 0
    let flatAmount = 0

    if (basePrice <= parseFloat(prices.wholesaleMarkup.lessThan)) {
      markupPercentage = parseFloat(prices.wholesaleMarkup.markupLessThan) / 100
      flatAmount = parseFloat(prices.wholesaleMarkup.andOrLessThan)
    } else if (
      basePrice >= parseFloat(prices.wholesaleMarkup.betweenStart) &&
      basePrice <= parseFloat(prices.wholesaleMarkup.betweenEnd)
    ) {
      markupPercentage = parseFloat(prices.wholesaleMarkup.markupBetween) / 100
      flatAmount = parseFloat(prices.wholesaleMarkup.andOrBetween)
    } else if (basePrice >= parseFloat(prices.wholesaleMarkup.over)) {
      markupPercentage = parseFloat(prices.wholesaleMarkup.markupOver) / 100
      flatAmount = parseFloat(prices.wholesaleMarkup.andOrOver)
    }

    return basePrice * markupPercentage + flatAmount
  }

  static getItemQuantity(sizes: QuoteItem['sizes']): number {
    return Object.values(sizes).reduce((sum, qty) => sum + Math.max(0, qty), 0)
  }

  static getTotalQuantity(quote: Quote): number {
    return quote.items.reduce(
      (sum, item) => this.getItemQuantity(item.sizes) + sum,
      0
    )
  }

  static getQuantityTier(quote: Quote, prices: Price): number {
    const qty = this.getTotalQuantity(quote)
    for (let i = 0; i < prices.printingQuantityRanges.length; i++) {
      const range = prices.printingQuantityRanges[i]
      const start = parseInt(range.start)
      const end = range.end ? parseInt(range.end) : Infinity
      
      if (qty >= start && qty <= end) {
        return i
      }
    }
    return -1
  }
}
