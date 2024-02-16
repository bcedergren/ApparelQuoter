export interface Price {
	_id: string;
	CompanyId: string;
	artCost: {
		firstColor: string;
		additionalColor: string;
		flatFee: string;
		inkMarkup: string;
		inkChargesPerPiece: string;
		glitterOrPuff: string;
		perScreenNew: string;
		perScreenExisting: string;
	};
	wholesaleMarkup: {
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
	};
	printingQuantityRanges: Array<{
		start: string;
		end: string;
	}>;
	printingLocationNames: string[];
	screenPrinting: {
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
	};
	dtgPrinting: {
		small: string[];
		medium: string[];
		large: string[];
	};
	dyeSublimation: { small: string[]; medium: string[]; large: string[] };
	preCutVinyl: {
		names: string[];
		numbers: string[];
	};
	embroidery: {
		stitchCount: string;
		costPerThousandStitches: string;
		hoopingFee: string;
		costPerFirst5000Stitches: string;
	};
	wholesaleWebsites: Array<{
		name: string;
		url: string;
		apiKey: string;
	}>;
}
