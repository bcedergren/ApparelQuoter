export interface Company {
	_id: string;
	name: string;
	streetAddress: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	fax?: string;
	email: string;
	url?: string;
	paymentMethods: string[];
	salesTax: string;
	creditCardCharge: string;
	offerings: string[];
	quoteIdFormat: string;
	apparelImages?: Array<{
		fileId: string;
		filename: string;
		displayName?: string;
		contentType?: string;
		length?: number;
		uploadDate?: string | Date;
	}>;
}
