import mongoose, { Document, Schema } from 'mongoose';

interface IQuoteItem {
	brandAndStyle: string;
	quoteType: string;
	color: string;
	standardPrice: number;
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

interface IEmbroideryDetails {
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

interface IPrintingOptions {
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

interface IPrintingDetails {
	colorMatches: number;
	inkType: string;
	artworkNeeded: boolean;
	deliveryDueDays: number;
	deliveryDueDate: Date;
}

interface IApparelAndShipping {
	customerProvidesApparel: boolean;
	creditCardCharge: boolean;
	shippingAndHandling: number;
	shippingAndHandlingTaxed: boolean;
}

interface IVinylDetails {
	namesFront: number;
	namesBack: number;
	numbersFront: number;
	numbersBack: number;
}

interface IScreenPrintingDetails {
	newScreensNeeded: boolean;
	additionalScreens: number;
	colorChanges: number;
}

interface ISummary {
	qty: number;
	avgCost: number;
	apparelCost: number;
	printingCost: number;
	shippingCost: number;
	taxCost: number;
	totalCost: number;
}

export interface IQuote extends Document {
	companyId?: mongoose.Schema.Types.ObjectId;
	selectedCustomerId?: mongoose.Schema.Types.ObjectId;
	customerName: string;
	quoteType:
		| 'invoices'
		| 'savedQuotes'
		| 'openOrders'
		| 'savedOrders'
		| 'completedOrders';
	items: IQuoteItem[];
	embroideryDetails: IEmbroideryDetails;
	printingOptions: IPrintingOptions;
	printingDetails: IPrintingDetails;
	apparelAndShipping: IApparelAndShipping;
	vinylDetails: IVinylDetails;
	screenPrintingDetails: IScreenPrintingDetails;
	summary: ISummary;
	CreatedAt?: Date;
	ModifiedAt?: Date;
}

const QuoteItemSchema = new Schema<IQuoteItem>({
	brandAndStyle: { type: String, required: true },
	quoteType: { type: String, required: true },
	color: { type: String, required: true },
	standardPrice: { type: Number, required: true },
	sizes: {
		XS: { type: Number, required: true },
		S: { type: Number, required: true },
		M: { type: Number, required: true },
		L: { type: Number, required: true },
		XL: { type: Number, required: true },
		'2XL': { type: Number, required: true },
		'3XL': { type: Number, required: true },
		'4XL': { type: Number, required: true },
		'5XL': { type: Number, required: true },
	},
	sizePrices: { type: Map, of: Number },
});

const EmbroideryDetailsSchema = new Schema<IEmbroideryDetails>({
	stitchesFront: { type: Number, required: true },
	hoopingFeeFront: { type: Boolean, required: true },
	stitchesBack: { type: Number, required: true },
	hoopingFeeBack: { type: Boolean, required: true },
	stitchesLeftSleeve: { type: Number, required: true },
	hoopingFeeLeftSleeve: { type: Boolean, required: true },
	stitchesRightSleeve: { type: Number, required: true },
	hoopingFeeRightSleeve: { type: Boolean, required: true },
	digitizingCost: { type: Number, required: true },
	setupFee: { type: Number, required: true },
	artworkFee: { type: Number, required: true },
});

const PrintingOptionsSchema = new Schema<IPrintingOptions>({
	colorsFront: { type: Number, required: true },
	flashFront: { type: Boolean, required: true },
	dtgDarkFront: { type: Boolean, required: true },
	colorsBack: { type: Number, required: true },
	flashBack: { type: Boolean, required: true },
	dtgDarkBack: { type: Boolean, required: true },
	colorsLeftSleeve: { type: Number, required: true },
	flashLeftSleeve: { type: Boolean, required: true },
	dtgDarkLeftSleeve: { type: Boolean, required: true },
	colorsRightSleeve: { type: Number, required: true },
	flashRightSleeve: { type: Boolean, required: true },
	dtgDarkRightSleeve: { type: Boolean, required: true },
});

const PrintingDetailsSchema = new Schema<IPrintingDetails>({
	colorMatches: { type: Number, required: true },
	inkType: { type: String, required: true },
	artworkNeeded: { type: Boolean, required: true },
	deliveryDueDays: { type: Number, required: true },
	deliveryDueDate: { type: Date, required: true },
});

const ApparelAndShippingSchema = new Schema<IApparelAndShipping>({
	customerProvidesApparel: { type: Boolean, required: true },
	creditCardCharge: { type: Boolean, required: true },
	shippingAndHandling: { type: Number, required: true },
	shippingAndHandlingTaxed: { type: Boolean, required: true },
});

const VinylDetailsSchema = new Schema<IVinylDetails>({
	namesFront: { type: Number, required: true },
	namesBack: { type: Number, required: true },
	numbersFront: { type: Number, required: true },
	numbersBack: { type: Number, required: true },
});

const ScreenPrintingDetailsSchema = new Schema<IScreenPrintingDetails>({
	newScreensNeeded: { type: Boolean, required: true },
	additionalScreens: { type: Number, required: true },
	colorChanges: { type: Number, required: true },
});

const SummarySchema = new Schema<ISummary>({
	qty: { type: Number, required: true },
	avgCost: { type: Number, required: true },
	apparelCost: { type: Number, required: true },
	printingCost: { type: Number, required: true },
	shippingCost: { type: Number, required: true },
	taxCost: { type: Number, required: true },
	totalCost: { type: Number, required: true },
});

const QuoteSchema = new Schema<IQuote>({
	companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
	selectedCustomerId: { type: Schema.Types.ObjectId, ref: 'Customer' },
	customerName: { type: String, required: true },
	quoteType: {
		type: String,
		enum: [
			'invoices',
			'savedQuotes',
			'openOrders',
			'savedOrders',
			'completedOrders',
		],
		required: true,
	},
	items: { type: [QuoteItemSchema], required: true },
	embroideryDetails: { type: EmbroideryDetailsSchema, required: true },
	printingOptions: { type: PrintingOptionsSchema, required: true },
	printingDetails: { type: PrintingDetailsSchema, required: true },
	apparelAndShipping: { type: ApparelAndShippingSchema, required: true },
	vinylDetails: { type: VinylDetailsSchema, required: true },
	screenPrintingDetails: { type: ScreenPrintingDetailsSchema, required: true },
	summary: { type: SummarySchema, required: true },
	CreatedAt: { type: Date, default: Date.now },
	ModifiedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quote ||
	mongoose.model<IQuote>('Quotes', QuoteSchema);
