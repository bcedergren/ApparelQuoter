import { Quote, Summary, QuoteItem } from '@/types/Quote';
import { Price, ScreenPrinting, ArtCost } from '@/types/Price';
import { Company } from '@/types/Company';

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
			};
		}

		const qty = this.getTotalQuantity(quote);
		const apparelCost = this.calculateApparelCost(quote, prices);
		const printingCost = this.calculatePrintingCost(quote, prices);
		let shippingCost = Number(
			quote.apparelAndShipping.shippingAndHandling || 0
		);

		// Add tax to shipping if "S&H Taxed" is true
		if (quote.apparelAndShipping.shippingAndHandlingTaxed) {
			const shippingTax = shippingCost * (parseInt(company.salesTax) / 100);
			shippingCost += shippingTax;
		}

		const taxCost = this.calculateTaxCost(
			quote,
			company,
			apparelCost,
			printingCost,
			shippingCost
		);

		let totalCost = apparelCost + printingCost + shippingCost + taxCost;

		// Apply Credit Card Charge if applicable
		if (quote.apparelAndShipping.creditCardCharge) {
			const creditCardChargeRate = parseFloat(company.creditCardCharge || '0');
			const creditCardFee = totalCost * (creditCardChargeRate / 100);
			totalCost += creditCardFee;
		}

		const avgCost = qty > 0 ? totalCost / qty : 0;

		return {
			qty,
			avgCost,
			apparelCost,
			printingCost,
			shippingCost,
			taxCost,
			totalCost,
		};
	}

	static calculateApparelCost(quote: Quote, prices: Price): number {
		return quote.items.reduce((sum, item) => {
			// Calculate the total item quantity
			const itemTotalQty = Object.values(item.sizes).reduce(
				(sizeSum, qty) => sizeSum + qty,
				0
			);

			let totalApparelCost = 0;
			let sizeCost = 0;
			let markup = 0;

			// Iterate over each size to apply the correct price
			Object.keys(item.sizes).forEach((sizeKey) => {
				const qtyForSize = item.sizes[sizeKey as keyof typeof item.sizes] || 0;
				sizeCost = item.standardPrice;

				// Check for special pricing for sizes like 2XL, 3XL, etc.
				if (sizeKey === '2XL' && item.sizePrices && item.sizePrices['2XL']) {
					sizeCost = item.sizePrices['2XL'];
				} else if (
					sizeKey === '3XL' &&
					item.sizePrices &&
					item.sizePrices['3XL']
				) {
					sizeCost = item.sizePrices['3XL'];
				} else if (
					sizeKey === '4XL' &&
					item.sizePrices &&
					item.sizePrices['4XL']
				) {
					sizeCost = item.sizePrices['4XL'];
				} else if (
					sizeKey === '5XL' &&
					item.sizePrices &&
					item.sizePrices['5XL']
				) {
					sizeCost = item.sizePrices['5XL'];
				}
			});

			// Now apply wholesale markup logic
			if (sizeCost > 0) {
				if (sizeCost < parseFloat(prices.wholesaleMarkup.lessThan)) {
					markup = parseFloat(prices.wholesaleMarkup.markupLessThan) / 100;
					markup += parseFloat(prices.wholesaleMarkup.andOrLessThan);
				} else if (
					sizeCost >= parseFloat(prices.wholesaleMarkup.betweenStart) &&
					sizeCost <= parseFloat(prices.wholesaleMarkup.betweenEnd)
				) {
					markup = parseFloat(prices.wholesaleMarkup.markupBetween) / 100;
					markup += parseFloat(prices.wholesaleMarkup.andOrBetween);
				} else if (sizeCost > parseFloat(prices.wholesaleMarkup.over)) {
					markup = parseFloat(prices.wholesaleMarkup.markupOver) / 100;
					markup += parseFloat(prices.wholesaleMarkup.andOrOver);
				}

				totalApparelCost = (sizeCost + markup) * itemTotalQty;

				return sum + totalApparelCost;
			}

			return sum;
		}, 0);
	}

	static calculatePrintingCost(quote: Quote, prices: Price): number {
		let printingCost = 0;

		// Screen Printing Cost
		const screenPrintingCost = this.calculateScreenPrintingCost(quote, prices);
		printingCost += screenPrintingCost;

		// Embroidery Cost
		const embroideryCost = this.calculateEmbroideryCost(quote, prices);
		printingCost += embroideryCost;

		// Vinyl Cost
		const vinylCost = this.calculateVinylCost(quote, prices);
		printingCost += vinylCost;

		return printingCost;
	}

	static calculateScreenPrintingCost(quote: Quote, prices: Price): number {
		let screenPrintingCost = 0;

		// Iterate over each printing location (e.g., 'colorsFront', 'colorsBack', etc.)
		Object.keys(quote.printingOptions).forEach((location) => {
			const colorCount =
				quote.printingOptions[location as keyof typeof quote.printingOptions];

			if (
				typeof colorCount === 'number' &&
				colorCount > 0 &&
				colorCount <= 12
			) {
				const colorKey = `${colorCount} color${
					colorCount > 1 ? 's' : ''
				}` as keyof ScreenPrinting;
				const quantityTier = this.getQuantityTier(quote, prices);

				if (
					prices.screenPrinting[colorKey] &&
					quantityTier >= 0 &&
					quantityTier < prices.screenPrinting[colorKey].length
				) {
					const colorCost = parseFloat(
						prices.screenPrinting[colorKey][quantityTier]
					);

					if (!isNaN(colorCost)) {
						const totalCostForLocation =
							colorCost * this.getTotalQuantity(quote);
						screenPrintingCost += totalCostForLocation;
					}
				}

				// Apply Flash Markup if enabled for this location
				const flashKey = `flash${location.replace(
					'colors',
					''
				)}` as keyof typeof quote.printingOptions;
				if (quote.printingOptions[flashKey]) {
					const flashCost =
						parseFloat(prices.artCost.flashMarkup || '0') *
						this.getTotalQuantity(quote);
					screenPrintingCost += flashCost;
				}

				// Apply DTG Dark Garment Markup if enabled for this location
				const dtgDarkKey = `dtgDark${location.replace(
					'colors',
					''
				)}` as keyof typeof quote.printingOptions;
				if (quote.printingOptions[dtgDarkKey]) {
					const dtgDarkCost =
						parseFloat(prices.artCost.dtgDarkGarmentMarkup || '0') *
						this.getTotalQuantity(quote);
					screenPrintingCost += dtgDarkCost;
				}
			}
		});

		// Add other applicable costs
		if (quote.screenPrintingDetails.additionalScreens > 0) {
			const newScreenCost = parseFloat(
				prices.screenPrinting.perScreenNew || '0'
			);
			screenPrintingCost +=
				quote.screenPrintingDetails.additionalScreens * newScreenCost;
		}

		return screenPrintingCost;
	}

	static calculateEmbroideryCost(quote: Quote, prices: Price): number {
		// Similar logic for embroidery cost calculation...
		return 0;
	}

	static calculateVinylCost(quote: Quote, prices: Price): number {
		// Similar logic for vinyl cost calculation...
		return 0;
	}

	static calculateTaxCost(
		quote: Quote,
		company: Company,
		apparelCost: number,
		printingCost: number,
		shippingCost: number
	): number {
		const taxableAmount = apparelCost + printingCost;
		const totalTaxableAmount = quote.apparelAndShipping.shippingAndHandlingTaxed
			? taxableAmount + shippingCost
			: taxableAmount;
		return totalTaxableAmount * (parseInt(company.salesTax) / 100);
	}

	static getTotalQuantity(quote: Quote): number {
		return quote.items.reduce(
			(sum, item) =>
				sum +
				Object.values(item.sizes).reduce((sizeSum, qty) => sizeSum + qty, 0),
			0
		);
	}

	static getQuantityTier(quote: Quote, prices: Price): number {
		const qty = this.getTotalQuantity(quote);
		for (let i = 0; i < prices.printingQuantityRanges.length; i++) {
			const range = prices.printingQuantityRanges[i];
			if (
				qty >= parseInt(range.start) &&
				(qty <= parseInt(range.end) || !range.end)
			) {
				return i;
			}
		}
		return -1;
	}
}
