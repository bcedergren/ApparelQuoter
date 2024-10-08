import {
	Quote,
	VinylDetails,
	EmbroideryDetails,
	QuoteItem,
	PrintingOptions as PrintingOptionsType,
	ScreenPrintingDetails as ScreenPrintingDetailsType,
	PrintingDetails,
	Summary,
} from '@/types/Quote';
import { QuoteCalculations } from '@/utils/_quoteCalculations';
import { Company } from '@/types/Company';
import {
	Price,
	Embroidery,
	ScreenPrinting,
	PreCutVinyl,
	ArtCost,
} from '@/types/Price';
import { toast } from 'react-toastify';

type Sizes = 'XS' | 'S' | 'M' | 'L' | 'XL' | '2XL' | '3XL' | '4XL' | '5XL';

// New function to get total quantity for a single item
export const getItemQuantity = (sizes: QuoteItem['sizes']): number => {
	return Object.values(sizes).reduce((sum, qty) => sum + qty, 0);
};

// Helper function to calculate the cost of a single item
export const getItemCost = (item: QuoteItem): number => {
	let totalItemCost = 0;

	Object.keys(item.sizes).forEach((size) => {
		const quantity = item.sizes[size as keyof typeof item.sizes] || 0;
		if (quantity > 0) {
			let sizeCost = item.standardPrice;

			if (
				['2XL', '3XL', '4XL', '5XL'].includes(size) &&
				item.sizePrices?.[size]
			) {
				sizeCost = item.sizePrices[size as keyof typeof item.sizePrices];
			}

			totalItemCost += sizeCost * quantity;
		}
	});

	return totalItemCost;
};

export const calculateBaseItemCost = (
	item: QuoteItem,
	itemQuantity: number,
	prices: Price // Pass in the prices object to apply markup
) => {
	const { sizes, standardPrice, sizePrices } = item;
	let totalBaseCost = 0;

	const standardSizes: Sizes[] = ['XS', 'S', 'M', 'L', 'XL'];
	const extendedSizes: Sizes[] = ['2XL', '3XL', '4XL', '5XL'];

	// Calculate the base cost for standard sizes individually
	standardSizes.forEach((size) => {
		const qtyForSize = sizes[size] || 0;

		// Skip size if quantity is zero
		if (qtyForSize === 0) return;

		let sizeCost = standardPrice;

		// Apply markup to the size cost before accumulating
		const sizeCostWithMarkup = applyMarkup(sizeCost, prices);
		totalBaseCost += qtyForSize * sizeCostWithMarkup;
	});

	// Calculate the base cost for extended sizes individually
	extendedSizes.forEach((size) => {
		const qtyForSize = sizes[size] || 0;

		// Skip size if quantity is zero
		if (qtyForSize === 0) return;

		let sizeCost = sizePrices?.[size] ?? standardPrice;

		// Apply markup to the size cost before accumulating
		const sizeCostWithMarkup = applyMarkup(sizeCost, prices);
		totalBaseCost += qtyForSize * sizeCostWithMarkup;
	});

	// Return the base cost per item, by dividing the total cost by the item quantity
	const baseCostPerItem = totalBaseCost / itemQuantity;

	return baseCostPerItem;
};

// Helper function to apply markup based on pricing rules
const applyMarkup = (basePrice: number, prices: Price): number => {
	let markupPercentage = 0;
	let flatAmount = 0;

	if (basePrice <= parseFloat(prices.wholesaleMarkup.lessThan)) {
		markupPercentage = parseFloat(prices.wholesaleMarkup.markupLessThan) / 100;
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

	// Calculate the markup price correctly
	const markupPrice = basePrice * markupPercentage + flatAmount;

	return parseFloat(markupPrice.toFixed(2));
};

export const calculateApparelCost = (quote: Quote, prices: Price): number => {
	return quote.items.reduce((totalApparelCost, item) => {
		let itemCost = 0;

		Object.keys(item.sizes).forEach((size) => {
			const quantity = item.sizes[size as keyof typeof item.sizes] || 0;
			let sizeCost = item.standardPrice;

			if (size === '2XL' && item.sizePrices && item.sizePrices['2XL']) {
				sizeCost = item.sizePrices['2XL'];
			} else if (size === '3XL' && item.sizePrices && item.sizePrices['3XL']) {
				sizeCost = item.sizePrices['3XL'];
			} else if (size === '4XL' && item.sizePrices && item.sizePrices['4XL']) {
				sizeCost = item.sizePrices['4XL'];
			} else if (size === '5XL' && item.sizePrices && item.sizePrices['5XL']) {
				sizeCost = item.sizePrices['5XL'];
			}

			itemCost += sizeCost * quantity;
		});

		return totalApparelCost + itemCost;
	}, 0);
};

export const calculateTotalPrintingCost = (
	quote: Quote,
	prices: Price
): number => {
	let totalPrintingCost = 0;

	// Get total quantity for all items
	const totalItemsQuantity = quote.items.reduce((sum, item) => {
		return (
			sum + Object.values(item.sizes).reduce((sizeSum, qty) => sizeSum + qty, 0)
		);
	}, 0);

	// Determine the correct quantity tier from the printingQuantityRanges object
	const getQuantityTierFromRanges = (qty: number): number => {
		const range = prices.printingQuantityRanges.find((range) => {
			const start = parseInt(range.start, 10);
			const end = range.end ? parseInt(range.end, 10) : Infinity; // Treat missing 'end' as infinity
			return qty >= start && qty <= end;
		});
		return range ? prices.printingQuantityRanges.indexOf(range) : -1;
	};

	const quantityTier = getQuantityTierFromRanges(totalItemsQuantity);

	// Iterate through each printing location
	Object.keys(quote.printingOptions).forEach((location) => {
		const colorCount =
			quote.printingOptions[location as keyof typeof quote.printingOptions];

		// Ensure colorCount is a number before performing number operations
		if (typeof colorCount === 'number' && colorCount > 0) {
			// Construct the correct key for the color count (e.g., '1 color', '2 colors', etc.)
			const colorKey = `${colorCount} color${
				colorCount > 1 ? 's' : ''
			}` as keyof ScreenPrinting;

			// Fetch the screen printing cost for the given color count and quantity tier
			const screenPrintingCost = prices.screenPrinting[colorKey]
				? parseFloat(prices.screenPrinting[colorKey][quantityTier])
				: 0;

			if (screenPrintingCost > 0) {
				// Add the screen printing cost for the total items quantity
				totalPrintingCost += screenPrintingCost * totalItemsQuantity;
			} else {
				toast.warn(`No screen printing cost found for ${colorCount} colors.`);
			}
		}
	});

	// Calculate additional costs (embroidery, vinyl, etc.)
	const embroideryCost = calculateEmbroideryCost(
		quote.embroideryDetails,
		prices.embroidery
	);
	const vinylCost = calculateVinylCost(quote.vinylDetails, prices.preCutVinyl);
	totalPrintingCost += embroideryCost + vinylCost;

	return totalPrintingCost;
};

export const calculateTaxCost = (
	apparelCost: number,
	printingCost: number,
	shippingCost: number,
	company: Company,
	quote: Quote
): number => {
	const taxableAmount = apparelCost + printingCost;
	const shippingTaxed =
		quote.apparelAndShipping.shippingAndHandlingTaxed ?? false;
	const totalTaxableAmount = shippingTaxed
		? taxableAmount + shippingCost
		: taxableAmount;
	return totalTaxableAmount * (parseFloat(company.salesTax) / 100);
};

export const getScreenPrintingCost = (
	colorCount: number,
	prices: Price
): number => {
	const key = `${colorCount} color${
		colorCount > 1 ? 's' : ''
	}` as keyof ScreenPrinting;
	const costArray = prices?.screenPrinting?.[key];
	return costArray ? parseFloat(costArray[0]) : 0;
};

export const calculateVinylCost = (
	vinylDetails: VinylDetails,
	prices: PreCutVinyl
): number => {
	const namePrice = parseFloat(prices?.names?.[0] || '0');
	const numberPrice = parseFloat(prices?.numbers?.[0] || '0');

	const namesCostFront = vinylDetails.namesFront * namePrice;
	const namesCostBack = vinylDetails.namesBack * namePrice;
	const numbersCostFront = vinylDetails.numbersFront * numberPrice;
	const numbersCostBack = vinylDetails.numbersBack * numberPrice;

	return namesCostFront + namesCostBack + numbersCostFront + numbersCostBack;
};

export const calculateEmbroideryCost = (
	embroideryDetails: EmbroideryDetails,
	prices: Embroidery
): number => {
	const costPerThousandStitches = parseFloat(
		prices?.costPerThousandStitches || '0'
	);
	const hoopingFee = parseFloat(prices?.hoopingFee || '0');

	const stitchesFrontCost =
		(embroideryDetails.stitchesFront / 1000) * costPerThousandStitches;
	const stitchesBackCost =
		(embroideryDetails.stitchesBack / 1000) * costPerThousandStitches;
	const stitchesLeftCost =
		(embroideryDetails.stitchesLeft / 1000) * costPerThousandStitches;
	const stitchesRightCost =
		(embroideryDetails.stitchesRight / 1000) * costPerThousandStitches;

	const hoopingCost =
		(embroideryDetails.hoopingFeeFront ? hoopingFee : 0) +
		(embroideryDetails.hoopingFeeBack ? hoopingFee : 0) +
		(embroideryDetails.hoopingFeeLeft ? hoopingFee : 0) +
		(embroideryDetails.hoopingFeeRight ? hoopingFee : 0);

	return (
		stitchesFrontCost +
		stitchesBackCost +
		stitchesLeftCost +
		stitchesRightCost +
		hoopingCost
	);
};

export const calculateMarkup = (
	baseItemCost: number,
	wholesaleMarkup: Price['wholesaleMarkup']
) => {
	let markupPercentage = 0;
	let flatAmount = 0;

	const lessThan = parseFloat(wholesaleMarkup?.lessThan ?? '0');
	const markupLessThan =
		parseFloat(wholesaleMarkup?.markupLessThan ?? '0') / 100;
	const andOrLessThan = parseFloat(wholesaleMarkup?.andOrLessThan ?? '0');

	const betweenStart = parseFloat(wholesaleMarkup?.betweenStart ?? '0');
	const betweenEnd = parseFloat(wholesaleMarkup?.betweenEnd ?? '0');
	const markupBetween = parseFloat(wholesaleMarkup?.markupBetween ?? '0') / 100;
	const andOrBetween = parseFloat(wholesaleMarkup?.andOrBetween ?? '0');

	const over = parseFloat(wholesaleMarkup?.over ?? '0');
	const markupOver = parseFloat(wholesaleMarkup?.markupOver ?? '0') / 100;
	const andOrOver = parseFloat(wholesaleMarkup?.andOrOver ?? '0');

	if (baseItemCost <= lessThan) {
		markupPercentage = markupLessThan;
		flatAmount = andOrLessThan;
	} else if (baseItemCost >= betweenStart && baseItemCost <= betweenEnd) {
		markupPercentage = markupBetween;
		flatAmount = andOrBetween;
	} else if (baseItemCost >= over) {
		markupPercentage = markupOver;
		flatAmount = andOrOver;
	}

	const markupPrice = (baseItemCost * markupPercentage + flatAmount).toFixed(2);

	return markupPrice;
};

// QuoteForm Utils
export const QuoteFormUtils = {
	handleCustomerSelect: (
		quote: Quote | null,
		customers: any[],
		customerId: string
	) => {
		const selectedCustomer = customers.find(
			(customer) => customer._id === customerId
		);

		return {
			...quote,
			customerName: selectedCustomer
				? selectedCustomer.companyName
				: quote?.customerName,
		};
	},

	handleDateChange: (quote: Quote | null, date: Date) => {
		const currentDate = new Date();
		const timeDiff = date.getTime() - currentDate.getTime();
		const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

		return {
			quote: {
				...quote,
				printingDetails: {
					...(quote?.printingDetails || {}),
					deliveryDueDate: date,
					deliveryDueDays: daysDiff,
				} as PrintingDetails,
			},
			deliveryDays: daysDiff,
		};
	},

	handleDepositPercentageChange: (quote: Quote | null, value: string) => {
		return {
			...quote,
			depositPercentage: parseFloat(value) || 0,
		};
	},

	handleBrandStyleQuantityChange: (
		quote: Quote | null,
		updatedItems: QuoteItem[],
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedQuote = {
			...quote,
			items: updatedItems,
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);

		return {
			...updatedQuote,
			summary,
		};
	},

	handleBrandStylePricingChange: (
		quote: Quote | null,
		updatedItems: QuoteItem[],
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedQuote: Quote = {
			...quote,
			items: updatedItems.map((updatedItem, index) => {
				const existingItem = quote.items[index];
				return {
					...existingItem,
					standardPrice: updatedItem.standardPrice,
					sizePrices: updatedItem.sizePrices
						? { ...existingItem.sizePrices, ...updatedItem.sizePrices }
						: existingItem.sizePrices,
				};
			}),
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);
		return {
			...updatedQuote,
			summary,
		};
	},

	handleApparelAndShippingChange: (
		quote: Quote | null,
		name: string,
		value: string | number | boolean,
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedApparelAndShipping = {
			...quote?.apparelAndShipping,
			[name]: value,
		};

		const updatedQuote = {
			...quote,
			apparelAndShipping: updatedApparelAndShipping,
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);
		return {
			...updatedQuote,
			summary,
		};
	},

	handlePrintingOptionsChange: (
		quote: Quote | null,
		updatedPrintingOptions: PrintingOptionsType,
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedQuote = {
			...quote,
			printingOptions: updatedPrintingOptions,
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);

		return {
			...updatedQuote,
			summary,
		};
	},

	handleCombinedPrintingDetailsChange: (
		quote: Quote | null,
		updatedDetails: {
			printingDetails: PrintingDetails;
			screenPrintingDetails: ScreenPrintingDetailsType;
		},
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedQuote = {
			...quote,
			printingDetails: updatedDetails.printingDetails,
			screenPrintingDetails: updatedDetails.screenPrintingDetails,
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);
		return {
			...updatedQuote,
			summary,
		};
	},

	handleVinylDetailsChange: (
		quote: Quote | null,
		updatedVinylDetails: VinylDetails,
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedQuote = {
			...quote,
			vinylDetails: updatedVinylDetails,
			customerName: quote?.customerName || '',
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);
		return {
			...updatedQuote,
			summary,
		};
	},

	handleEmbroideryOptionsChange: (
		quote: Quote | null,
		updatedEmbroideryDetails: EmbroideryDetails,
		company: Company | null,
		prices: Price | null
	) => {
		if (!quote || !company) return quote;

		const updatedQuote: Quote = {
			...quote,
			embroideryDetails: updatedEmbroideryDetails,
		};

		const summary = QuoteCalculations.calculateSummary(
			updatedQuote,
			company,
			prices
		);
		return {
			...updatedQuote,
			summary,
		};
	},
};
