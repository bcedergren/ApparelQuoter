// quoteCalculations.ts

import { Quote, Summary } from '@/types/Quote';
import { Price, ScreenPrinting } from '@/types/Price';

export class QuoteCalculations {
	static calculateSummary(quote: Quote, prices: Price | null): Summary {
		console.log('Quote: ', quote);
		console.log('Price: ', prices);

		if (!prices)
			return {
				qty: 0,
				avgCost: 0,
				apparelCost: 0,
				printingCost: 0,
				shippingCost: 0,
				taxCost: 0,
				totalCost: 0,
			};

		// Calculate the total quantity of items
		const qty = quote.items.reduce((sum, item) => {
			return (
				sum +
				Object.values(item.sizes).reduce((sizeSum, qty) => sizeSum + qty, 0)
			);
		}, 0);

		// Calculate the total apparel cost
		const apparelCost = quote.items.reduce((sum, item) => {
			const itemTotalQty = Object.values(item.sizes).reduce(
				(sizeSum, qty) => sizeSum + qty,
				0
			);
			const itemCost = item.standardPrice * itemTotalQty;
			return sum + itemCost;
		}, 0);

		// Calculate the total printing cost based on user selections
		const printingCost = this.calculatePrintingCost(quote, prices);

		const shippingCost = quote.apparelAndShipping.shippingAndHandling || 0;

		// Tax calculation (if applicable)
		const taxCost = 0; // Set to 0 if there's no tax logic

		// Calculate total cost
		const totalCost = apparelCost + printingCost + shippingCost + taxCost;

		// Calculate average cost per item
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

	static calculatePrintingCost(quote: Quote, prices: Price): number {
		let printingCost = 0;

		// Screen Printing Costs: Add cost based on the number of new screens needed
		if (
			quote.screenPrintingDetails.newScreensNeeded &&
			quote.screenPrintingDetails.additionalScreens > 0
		) {
			const newScreenCost = parseFloat(
				prices.screenPrinting.perScreenNew || '0'
			);
			printingCost +=
				quote.screenPrintingDetails.additionalScreens * newScreenCost;
		}

		// Screen Printing Costs: Add cost based on the number of colors selected
		const colorKey =
			`${quote.printingOptions.colorsFront} colors` as keyof ScreenPrinting;
		if (
			quote.printingOptions.colorsFront > 0 &&
			prices.screenPrinting[colorKey]
		) {
			const colorCost = parseFloat(prices.screenPrinting[colorKey][0] || '0'); // Assuming prices are stored in an array
			printingCost +=
				colorCost *
				quote.items.reduce(
					(sum, item) =>
						sum +
						Object.values(item.sizes).reduce(
							(sizeSum, qty) => sizeSum + qty,
							0
						),
					0
				);
		}

		// Embroidery Costs
		if (quote.embroideryDetails.stitchesFront > 0) {
			printingCost +=
				(quote.embroideryDetails.stitchesFront / 1000) *
				parseFloat(prices.embroidery.costPerThousandStitches || '0');
		}

		// Vinyl Details
		if (quote.vinylDetails.namesFront > 0) {
			printingCost +=
				quote.vinylDetails.namesFront *
				parseFloat(prices.preCutVinyl.names[0] || '0'); // Assuming names[0] contains the price
		}

		// Check other printing options or scenarios as needed

		return printingCost;
	}
}
