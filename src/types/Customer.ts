export interface Customer {
	_id?: string;
	companyId?: string; // To associate the customer with a specific company
	companyName: string;
	contactName: string;
	address: string;
	address2: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	email: string;
	depositPercentage: number;
	totalDueDays: number;
}
