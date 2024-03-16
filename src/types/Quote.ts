export interface Quote {
	_id: string;
	companyId?: string;
	selectedCustomerId?: string;
	customerName: string;
	quoteType: 'Invoice' | 'Quote';
	items: QuoteItem[]; // Array to handle multiple items
	embroideryDetails: EmbroideryDetails;
	printingOptions: PrintingOptions;
	printingDetails: PrintingDetails;
	apparelAndShipping: ApparelAndShipping;
	vinylDetails: VinylDetails;
	screenPrintingDetails: ScreenPrintingDetails;
	summary: Summary;
	CreatedAt?: Date;
	ModifiedAt?: Date;
}

export interface QuoteItem {
	brandAndStyle: string;
	color: string;
	standardPrice: number; // This field is for sizes XS through XL
	sizes: {
		XS: number;
		S: number;
		M: number;
		L: number;
		XL: number;
		'2XL': number;
		'3XL': number;
		'4XL': number;
		'5XL': number;
	};
	sizePrices?: {
		[key: string]: number;
	};
}

export interface EmbroideryDetails {
	stitchesFront: number;
	hoopingFeeFront: boolean;
	stitchesBack: number;
	hoopingFeeBack: boolean;
	stitchesLeftSleeve: number;
	hoopingFeeLeftSleeve: boolean;
	stitchesRightSleeve: number;
	hoopingFeeRightSleeve: boolean;
	digitizingCost: number;
	setupFee: number;
	artworkFee: number;
}

export interface PrintingOptions {
	colorsFront: number;
	flashFront: boolean;
	dtgDarkFront: boolean;
	colorsBack: number;
	flashBack: boolean;
	dtgDarkBack: boolean;
	colorsLeftSleeve: number;
	flashLeftSleeve: boolean;
	dtgDarkLeftSleeve: boolean;
	colorsRightSleeve: number;
	flashRightSleeve: boolean;
	dtgDarkRightSleeve: boolean;
}

export interface PrintingDetails {
	colorMatches: number;
	inkType: string;
	artworkNeeded: boolean;
	deliveryDueDays: number;
}

export interface ApparelAndShipping {
	customerProvidesApparel: boolean;
	creditCardCharge: boolean;
	shippingAndHandling: number;
	shippingAndHandlingTaxed: boolean;
}

export interface VinylDetails {
	namesFront: number;
	namesBack: number;
	numbersFront: number;
	numbersBack: number;
}

export interface ScreenPrintingDetails {
	newScreensNeeded: boolean;
	additionalScreens: number;
	colorChanges: number;
}

export interface Summary {
	qty: number;
	avgCost: number;
	apparelCost: number;
	printingCost: number;
	shippingCost: number;
	taxCost: number;
	totalCost: number;
}

export type SizeKey = keyof QuoteItem['sizes'];
export type ValidSizeKey = '2XL' | '3XL' | '4XL' | '5XL';
