export interface Quote {
	_id: string; // Unique identifier for the quote
	companyId?: string; // ID of the company associated with this quote
	selectedCustomerId?: string; // ID of the selected customer
	customerName: string; // Name of the customer
	quoteType:
		| 'invoices'
		| 'savedQuotes'
		| 'openOrders'
		| 'savedOrders'
		| 'completedOrders'; // Type of quote
	items: QuoteItem[]; // Array to handle multiple items in the quote
	embroideryDetails: EmbroideryDetails; // Embroidery-specific details
	printingOptions: PrintingOptions; // Options for printing
	printingDetails: PrintingDetails; // Additional printing details
	apparelAndShipping: ApparelAndShipping; // Apparel and shipping information
	vinylDetails: VinylDetails; // Vinyl printing details
	screenPrintingDetails: ScreenPrintingDetails; // Screen printing-specific details
	summary: Summary; // Summary of costs and quantities
	depositPercentage: number; // Percentage of deposit required
	CreatedAt?: Date; // Date when the quote was created
	ModifiedAt?: Date; // Date when the quote was last modified
}

export interface QuoteItem {
	brandAndStyle: string; // Brand and style of the item
	quoteType: string; // Type of the quote item
	color: string; // Color of the item
	standardPrice: number; // Standard price for sizes XS through XL
	sizes: {
		XS: number; // Quantity for size XS
		S: number; // Quantity for size S
		M: number; // Quantity for size M
		L: number; // Quantity for size L
		XL: number; // Quantity for size XL
		'2XL': number; // Quantity for size 2XL
		'3XL': number; // Quantity for size 3XL
		'4XL': number; // Quantity for size 4XL
		'5XL': number; // Quantity for size 5XL
	};
	sizePrices?: {
		// Optional price adjustments for sizes
		[key: string]: number;
	};
}

export interface EmbroideryDetails {
	stitchesFront: number; // Number of stitches on the front
	hoopingFeeFront: boolean; // Whether a hooping fee applies for the front
	stitchesBack: number; // Number of stitches on the back
	hoopingFeeBack: boolean; // Whether a hooping fee applies for the back
	stitchesLeftSleeve: number; // Number of stitches on the left sleeve
	hoopingFeeLeftSleeve: boolean; // Whether a hooping fee applies for the left sleeve
	stitchesRightSleeve: number; // Number of stitches on the right sleeve
	hoopingFeeRightSleeve: boolean; // Whether a hooping fee applies for the right sleeve
	digitizingCost: number; // Cost of digitizing the design
	setupFee: number; // Setup fee for embroidery
	artworkFee: number; // Fee for artwork preparation
}

export interface PrintingOptions {
	colorsFront: number; // Number of colors used on the front
	flashFront: boolean; // Whether flash curing is used on the front
	dtgDarkFront: boolean; // Whether direct-to-garment (DTG) printing is used on dark shirts for the front
	colorsBack: number; // Number of colors used on the back
	flashBack: boolean; // Whether flash curing is used on the back
	dtgDarkBack: boolean; // Whether DTG printing is used on dark shirts for the back
	colorsLeftSleeve: number; // Number of colors used on the left sleeve
	flashLeftSleeve: boolean; // Whether flash curing is used on the left sleeve
	dtgDarkLeftSleeve: boolean; // Whether DTG printing is used on dark shirts for the left sleeve
	colorsRightSleeve: number; // Number of colors used on the right sleeve
	flashRightSleeve: boolean; // Whether flash curing is used on the right sleeve
	dtgDarkRightSleeve: boolean; // Whether DTG printing is used on dark shirts for the right sleeve
}

export interface PrintingDetails {
	colorMatches: number; // Number of color matches needed
	artworkNeeded: boolean; // Whether artwork is needed
	deliveryDueDays: number; // Number of days until delivery is due
	deliveryDueDate: Date; // Date when delivery is due
}

export interface ApparelAndShipping {
	customerProvidesApparel: boolean; // Whether the customer provides the apparel
	creditCardCharge: boolean; // Whether a credit card charge applies
	shippingAndHandling: number; // Cost of shipping and handling
	shippingAndHandlingTaxed: boolean; // Whether shipping and handling are taxed
}

export interface VinylDetails {
	namesFront: number; // Number of names printed on the front
	namesBack: number; // Number of names printed on the back
	numbersFront: number; // Number of numbers printed on the front
	numbersBack: number; // Number of numbers printed on the back
}

export interface ScreenPrintingDetails {
	newScreensNeeded: boolean; // Whether new screens are needed
	additionalScreens: number; // Number of additional new screens
	colorChanges: number; // Number of color changes needed
	inkType: string; // Type of ink used (e.g., None, Puff, Glitter)
}

export interface Summary {
	qty: number; // Total quantity of items
	avgCost: number; // Average cost per item
	apparelCost: number; // Total cost for apparel
	printingCost: number; // Total cost for printing
	shippingCost: number; // Total cost for shipping
	taxCost: number; // Total tax cost
	totalCost: number; // Total cost for the order
}

// Helper types
export type SizeKey = keyof QuoteItem['sizes']; // Key type for sizes
export type ValidSizeKey = '2XL' | '3XL' | '4XL' | '5XL'; // Valid size keys
