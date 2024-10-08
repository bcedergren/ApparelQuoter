export interface ArtCost {
	firstColor: string;
	additionalColor: string;
	flatFee: string;
	inkMarkup: string;
	inkChargesPerPiece: string;
	glitterOrPuff: string;
	colorMatch: string;
	inkColorChanges: string;
	dtgDarkGarmentMarkup: string;
	flashMarkup: string;
}

export interface WholesaleMarkup {
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

export interface ScreenPrinting {
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

export interface DyeSublimation {
	quantity: string[];
}

export interface PreCutVinyl {
	names: string[];
	numbers: string[];
}

export interface PrintingQuantityRange {
	start: string;
	end: string;
}

export interface Embroidery {
	stitchCount: string;
	costPerThousandStitches: string;
	hoopingFee: string;
	costPerFirst5000Stitches: string;
}

export interface Price {
	_id: string;
	CompanyId: string;
	artCost: ArtCost;
	wholesaleMarkup: WholesaleMarkup;
	printingQuantityRanges: Array<PrintingQuantityRange>;
	printingLocationNames: string[];
	screenPrinting: ScreenPrinting;
	dyeSublimation: DyeSublimation;
	preCutVinyl: PreCutVinyl;
	embroidery: Embroidery;
}
