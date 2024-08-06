import mongoose, { Document, Schema } from 'mongoose';

export interface ICompany extends Document {
	name: string;
	streetAddress?: string;
	city?: string;
	state?: string;
	zip?: string;
	phone?: string;
	fax?: string;
	email?: string;
	url?: string;
	paymentMethods?: string[];
	salesTax?: string;
	creditCardCharge?: string;
	offerings?: string[];
}

const CompanySchema: Schema = new Schema({
	name: { type: String, required: true },
	streetAddress: { type: String },
	city: { type: String },
	state: { type: String },
	zip: { type: String },
	phone: { type: String },
	fax: { type: String },
	email: { type: String },
	url: { type: String },
	paymentMethods: { type: [String] },
	salesTax: { type: String },
	creditCardCharge: { type: String },
	offerings: { type: [String] },
});

export default mongoose.models.Company ||
	mongoose.model<ICompany>('Company', CompanySchema);
