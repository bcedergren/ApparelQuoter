export interface FollowUpNote {
	date: Date;
	note: string;
	addedBy: string;
	addedDate: Date;
}

export interface Customer {
	_id?: string;
	companyId?: string;
	companyName: string;
	contactName: string;
	address: string;
	address2?: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	email: string;
	followUpNotes: FollowUpNote[];
	createdBy: string;
	createdDate: Date;
}
