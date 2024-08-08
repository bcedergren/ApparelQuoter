import mongoose, { Document, Schema } from 'mongoose';

interface IArtCost {
	firstColor: string;
	additionalColor: string;
	flatFee: string;
	inkMarkup: string;
	inkChargesPerPiece: string;
	glitterOrPuff: string;
	colorMatch: string;
	inkColorChanges: string;
}

interface IDTGDarkGarmentMarkup {
	small: string[];
	medium: string[];
	large: string[];
}

interface IWholesaleMarkup {
	lessThan: string;
	betweenStart: string;
	betweenEnd: string;
	over: string;
	markupLessThan: string;
	markupBetween: string;
	markupOver: string;
	andOrLessThan: string;
	andOrBetween: string;
	andOrOver: string;
}

interface IScreenPrinting {
	'1 color': string[];
	'2 colors': string[];
	'3 colors': string[];
	'4 colors': string[];
	'5 colors': string[];
	'6 colors': string[];
	'7 colors': string[];
	'8 colors': string[];
	'9 colors': string[];
	'10 colors': string[];
	'11 colors': string[];
	'12 colors': string[];
	perScreenNew: string;
	perScreenExisting: string;
}

interface IDTGPrinting {
	small: string[];
	medium: string[];
	large: string[];
}

interface IDyeSublimation {
	small: string[];
	medium: string[];
	large: string[];
}

interface IPreCutVinyl {
	names: string[];
	numbers: string[];
}

interface IPrintingQuantityRange {
	start: string;
	end: string;
}

interface IEmbroidery {
	stitchCount: string;
	costPerThousandStitches: string;
	hoopingFee: string;
	costPerFirst5000Stitches: string;
}

interface IPrice extends Document {
	CompanyId: mongoose.Schema.Types.ObjectId;
	artCost: IArtCost;
	wholesaleMarkup: IWholesaleMarkup;
	printingQuantityRanges: IPrintingQuantityRange[];
	printingLocationNames: string[];
	screenPrinting: IScreenPrinting;
	dtgPrinting: IDTGPrinting;
	dtgDarkGarmentMarkup: IDTGDarkGarmentMarkup;
	dyeSublimation: IDyeSublimation;
	preCutVinyl: IPreCutVinyl;
	embroidery: IEmbroidery;
}

const ArtCostSchema = new Schema<IArtCost>({
	firstColor: { type: String, required: true },
	additionalColor: { type: String, required: true },
	flatFee: { type: String, required: true },
	inkMarkup: { type: String, required: true },
	inkChargesPerPiece: { type: String, required: true },
	glitterOrPuff: { type: String, required: true },
	colorMatch: { type: String, required: true },
	inkColorChanges: { type: String, required: true },
});

const DTGDarkGarmentMarkupSchema = new Schema<IDTGDarkGarmentMarkup>({
	small: [{ type: String, required: true }],
	medium: [{ type: String, required: true }],
	large: [{ type: String, required: true }],
});

const WholesaleMarkupSchema = new Schema<IWholesaleMarkup>({
	lessThan: { type: String, required: true },
	betweenStart: { type: String, required: true },
	betweenEnd: { type: String, required: true },
	over: { type: String, required: true },
	markupLessThan: { type: String, required: true },
	markupBetween: { type: String, required: true },
	markupOver: { type: String, required: true },
	andOrLessThan: { type: String, required: true },
	andOrBetween: { type: String, required: true },
	andOrOver: { type: String, required: true },
});

const ScreenPrintingSchema = new Schema<IScreenPrinting>({
	'1 color': [{ type: String, required: true }],
	'2 colors': [{ type: String, required: true }],
	'3 colors': [{ type: String, required: true }],
	'4 colors': [{ type: String, required: true }],
	'5 colors': [{ type: String, required: true }],
	'6 colors': [{ type: String, required: true }],
	'7 colors': [{ type: String, required: true }],
	'8 colors': [{ type: String, required: true }],
	'9 colors': [{ type: String, required: true }],
	'10 colors': [{ type: String, required: true }],
	'11 colors': [{ type: String, required: true }],
	'12 colors': [{ type: String, required: true }],
	perScreenNew: { type: String, required: true },
	perScreenExisting: { type: String, required: true },
});

const DTGPrintingSchema = new Schema<IDTGPrinting>({
	small: [{ type: String, required: true }],
	medium: [{ type: String, required: true }],
	large: [{ type: String, required: true }],
});

const DyeSublimationSchema = new Schema<IDyeSublimation>({
	small: [{ type: String, required: true }],
	medium: [{ type: String, required: true }],
	large: [{ type: String, required: true }],
});

const PreCutVinylSchema = new Schema<IPreCutVinyl>({
	names: [{ type: String, required: true }],
	numbers: [{ type: String, required: true }],
});

const PrintingQuantityRangeSchema = new Schema<IPrintingQuantityRange>({
	start: { type: String, required: true },
	end: { type: String, required: true },
});

const EmbroiderySchema = new Schema<IEmbroidery>({
	stitchCount: { type: String, required: true },
	costPerThousandStitches: { type: String, required: true },
	hoopingFee: { type: String, required: true },
	costPerFirst5000Stitches: { type: String, required: true },
});

const PriceSchema = new Schema<IPrice>({
	CompanyId: { type: Schema.Types.ObjectId, required: true },
	artCost: { type: ArtCostSchema, required: true },
	wholesaleMarkup: { type: WholesaleMarkupSchema, required: true },
	printingQuantityRanges: {
		type: [PrintingQuantityRangeSchema],
		required: true,
	},
	printingLocationNames: [{ type: String, required: true }],
	screenPrinting: { type: ScreenPrintingSchema, required: true },
	dtgPrinting: { type: DTGPrintingSchema, required: true },
	dtgDarkGarmentMarkup: { type: DTGDarkGarmentMarkupSchema, required: true },
	dyeSublimation: { type: DyeSublimationSchema, required: true },
	preCutVinyl: { type: PreCutVinylSchema, required: true },
	embroidery: { type: EmbroiderySchema, required: true },
});

export default mongoose.models.Price ||
	mongoose.model<IPrice>('Price', PriceSchema);
