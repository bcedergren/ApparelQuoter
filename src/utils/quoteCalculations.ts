import { Quote, QuoteItem } from '@/types/Quote';
import {
	Price,
	ScreenPrinting,
	PreCutVinyl,
	Embroidery,
	ArtCost,
} from '@/types/Price';
import { Summary } from '@/types/Quote';
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
			const itemTotalQty = this.getItemQuantity(item.sizes);
			let sizeCost = 0;
			let markup = 0;
			let totalApparelCost = 0;

			Object.keys(item.sizes).forEach((sizeKey) => {
				const qtyForSize = item.sizes[sizeKey as keyof typeof item.sizes] || 0;
				sizeCost = item.sizePrices?.[sizeKey] || item.standardPrice;
			});

			if (sizeCost > 0) {
				markup = this.applyMarkup(sizeCost, prices);
				totalApparelCost = (sizeCost + markup) * itemTotalQty;
				return sum + totalApparelCost;
			}
			return sum;
		}, 0);
	}

	static calculateBaseItemCost(
		item: QuoteItem,
		itemQuantity: number,
		prices: Price
	): number {
		const { sizes, standardPrice, sizePrices } = item;
		let totalBaseCost = 0;

		// Declare the sizes arrays with explicit types
		const standardSizes: Array<keyof typeof sizes> = [
			'XS',
			'S',
			'M',
			'L',
			'XL',
		];
		const extendedSizes: Array<keyof typeof sizes> = [
			'2XL',
			'3XL',
			'4XL',
			'5XL',
		];

		// Calculate the base cost for standard sizes
		standardSizes.forEach((size) => {
			const qtyForSize = sizes[size] || 0;

			if (qtyForSize === 0) return;

			let sizeCost = standardPrice;
			const sizeCostWithMarkup = this.applyMarkup(sizeCost, prices);
			totalBaseCost += qtyForSize * sizeCostWithMarkup;
		});

		// Calculate the base cost for extended sizes
		extendedSizes.forEach((size) => {
			const qtyForSize = sizes[size] || 0;

			if (qtyForSize === 0) return;

			let sizeCost = sizePrices?.[size] ?? standardPrice;
			const sizeCostWithMarkup = this.applyMarkup(sizeCost, prices);
			totalBaseCost += qtyForSize * sizeCostWithMarkup;
		});

		const baseCostPerItem = totalBaseCost / itemQuantity;
		return baseCostPerItem;
	}

	static calculatePrintingCost(quote: Quote, prices: Price): number {
		let printingCost = 0;

		// Screen Printing Cost
		printingCost += this.calculateScreenPrintingCost(quote, prices);

		// Embroidery Cost
		printingCost += this.calculateEmbroideryCost(quote, prices);

		// Vinyl Cost
		printingCost += this.calculateVinylCost(quote, prices);

		return printingCost;
	}

	static calculateScreenPrintingCost(quote: Quote, prices: Price): number {
		let screenPrintingCost = 0;
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
				if (prices.screenPrinting[colorKey] && quantityTier >= 0) {
					const colorCost = parseFloat(
						prices.screenPrinting[colorKey][quantityTier]
					);
					screenPrintingCost += colorCost * this.getTotalQuantity(quote);
				}
			}
		});
		return screenPrintingCost;
	}

	static calculateEmbroideryCost(quote: Quote, prices: Price): number {
		let embroideryCost = 0;
		if (quote.embroideryDetails) {
			embroideryCost =
				(parseFloat(prices.embroidery?.costPerThousandStitches || '0') *
					quote.embroideryDetails.stitchesFront) /
				1000;
		}
		return embroideryCost;
	}

	static calculateVinylCost(quote: Quote, prices: Price): number {
		let vinylCost = 0;
		if (quote.vinylDetails) {
			const vinylNameCost =
				parseFloat(prices.preCutVinyl?.names[0] || '0') *
				quote.vinylDetails.namesFront;
			const vinylNumberCost =
				parseFloat(prices.preCutVinyl?.numbers[0] || '0') *
				quote.vinylDetails.numbersFront;
			vinylCost = vinylNameCost + vinylNumberCost;
		}
		return vinylCost;
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

	static applyMarkup(basePrice: number, prices: Price): number {
		let markupPercentage = 0;
		let flatAmount = 0;

		if (basePrice <= parseFloat(prices.wholesaleMarkup.lessThan)) {
			markupPercentage =
				parseFloat(prices.wholesaleMarkup.markupLessThan) / 100;
			flatAmount = parseFloat(prices.wholesaleMarkup.andOrLessThan);
		} else if (
			basePrice >= parseFloat(prices.wholesaleMarkup.betweenStart) &&
			basePrice <= parseFloat(prices.wholesaleMarkup.betweenEnd)
		) {
			markupPercentage = parseFloat(prices.wholesaleMarkup.markupBetween) / 100;
			flatAmount = parseFloat(prices.wholesaleMarkup.andOrBetween);
		} else if (basePrice >= parseFloat(prices.wholesaleMarkup.over)) {
			markupPercentage = parseFloat(prices.wholesaleMarkup.markupOver) / 100;
			flatAmount = parseFloat(prices.wholesaleMarkup.andOrOver);
		}

		return basePrice * markupPercentage + flatAmount;
	}

	static getItemQuantity(sizes: QuoteItem['sizes']): number {
		return Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
	}

	static getTotalQuantity(quote: Quote): number {
		return quote.items.reduce(
			(sum, item) => this.getItemQuantity(item.sizes) + sum,
			0
		);
	}

	static getQuantityTier(quote: Quote, prices: Price): number {
		const qty = this.getTotalQuantity(quote);
		for (let i = 0; i < prices.printingQuantityRanges.length; i++) {
			const range = prices.printingQuantityRanges[i];
			if (
				qty >= parseInt(range.start) &&
				(!range.end || qty <= parseInt(range.end))
			) {
				return i;
			}
		}
		return -1;
	}
}
