import mongoose, { Document, Schema } from 'mongoose';

// Interfaces for sub-documents and main document
interface IQuoteItem {
	brandAndStyle: string;
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
	stitchesLeft: number;
	hoopingFeeLeft: boolean;
	stitchesRight: number;
	hoopingFeeRight: boolean;
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
	colorsLeft: number;
	flashLeft: boolean;
	dtgDarkLeft: boolean;
	colorsRight: number;
	flashRight: boolean;
	dtgDarkRight: boolean;
}

interface IPrintingDetails {
	colorMatches: number;
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
	inkType: string;
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

// Main Quote interface

export interface IQuote extends Document {
	companyId?: mongoose.Schema.Types.ObjectId;
	selectedCustomerId?: mongoose.Schema.Types.ObjectId;
	customerName: string;
	quoteType:
		| 'invoices'
		| 'savedQuotes'
		| 'openOrders'
		| 'savedOrders'
		| 'completedOrders'
		| 'closedOrders';
	quoteId: string;
	items: IQuoteItem[];
	embroideryDetails: IEmbroideryDetails;
	printingOptions: IPrintingOptions;
	printingDetails: IPrintingDetails;
	apparelAndShipping: IApparelAndShipping;
	vinylDetails: IVinylDetails;
	screenPrintingDetails: IScreenPrintingDetails;
	summary: ISummary;
	depositPercentage: number;
	totalDueDays: number;
	CreatedAt?: Date;
	ModifiedAt?: Date;
}

// Schema Definitions for sub-documents
const QuoteItemSchema = new Schema<IQuoteItem>({
	brandAndStyle: { type: String, required: true },
	color: { type: String, required: true },
	standardPrice: { type: Number, required: true },
	sizes: {
		XS: { type: Number },
		S: { type: Number },
		M: { type: Number },
		L: { type: Number },
		XL: { type: Number },
		'2XL': { type: Number },
		'3XL': { type: Number },
		'4XL': { type: Number },
		'5XL': { type: Number },
	},
	sizePrices: { type: Map, of: Number },
});

const EmbroideryDetailsSchema = new Schema<IEmbroideryDetails>({
	stitchesFront: { type: Number },
	hoopingFeeFront: { type: Boolean },
	stitchesBack: { type: Number },
	hoopingFeeBack: { type: Boolean },
	stitchesLeft: { type: Number },
	hoopingFeeLeft: { type: Boolean },
	stitchesRight: { type: Number },
	hoopingFeeRight: { type: Boolean },
	digitizingCost: { type: Number },
	setupFee: { type: Number },
	artworkFee: { type: Number },
});

const PrintingOptionsSchema = new Schema<IPrintingOptions>({
	colorsFront: { type: Number },
	flashFront: { type: Boolean },
	dtgDarkFront: { type: Boolean },
	colorsBack: { type: Number },
	flashBack: { type: Boolean },
	dtgDarkBack: { type: Boolean },
	colorsLeft: { type: Number },
	flashLeft: { type: Boolean },
	dtgDarkLeft: { type: Boolean },
	colorsRight: { type: Number },
	flashRight: { type: Boolean },
	dtgDarkRight: { type: Boolean },
});

const PrintingDetailsSchema = new Schema<IPrintingDetails>({
	colorMatches: { type: Number },
	artworkNeeded: { type: Boolean, required: true },
	deliveryDueDays: { type: Number, required: true },
	deliveryDueDate: { type: Date, required: true },
});

const ApparelAndShippingSchema = new Schema<IApparelAndShipping>({
	customerProvidesApparel: { type: Boolean, required: true },
	creditCardCharge: { type: Boolean, required: true },
	shippingAndHandling: { type: Number },
	shippingAndHandlingTaxed: { type: Boolean, required: true },
});

const VinylDetailsSchema = new Schema<IVinylDetails>({
	namesFront: { type: Number },
	namesBack: { type: Number },
	numbersFront: { type: Number },
	numbersBack: { type: Number },
});

const ScreenPrintingDetailsSchema = new Schema<IScreenPrintingDetails>({
	newScreensNeeded: { type: Boolean, required: true },
	additionalScreens: { type: Number },
	colorChanges: { type: Number },
	inkType: { type: String, required: true },
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

// Main Quote Schema

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
			'closedOrders',
		],
		required: true,
	},
	quoteId: { type: String, required: true },
	items: { type: [QuoteItemSchema], required: true },
	embroideryDetails: { type: EmbroideryDetailsSchema, required: true },
	printingOptions: { type: PrintingOptionsSchema, required: true },
	printingDetails: { type: PrintingDetailsSchema, required: true },
	apparelAndShipping: { type: ApparelAndShippingSchema, required: true },
	vinylDetails: { type: VinylDetailsSchema, required: true },
	screenPrintingDetails: { type: ScreenPrintingDetailsSchema, required: true },
	summary: { type: SummarySchema, required: true },
	depositPercentage: { type: Number, required: true },
	totalDueDays: { type: Number, required: true },
	CreatedAt: { type: Date, default: Date.now },
	ModifiedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Quotes ||
	mongoose.model<IQuote>('Quotes', QuoteSchema);
