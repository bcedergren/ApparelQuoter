export interface Company {
	_id: string;
	companyName: string;
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
}
