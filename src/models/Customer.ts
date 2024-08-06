import mongoose, { Document, Schema } from 'mongoose';

export interface ICustomer extends Document {
	companyId?: mongoose.Schema.Types.ObjectId;
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

const CustomerSchema: Schema = new Schema(
	{
		companyId: { type: Schema.Types.ObjectId, ref: 'Company' },
		companyName: { type: String, required: true },
		contactName: { type: String, required: true },
		address: { type: String, required: true },
		address2: { type: String },
		city: { type: String, required: true },
		state: { type: String, required: true },
		zip: { type: String, required: true },
		phone: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		depositPercentage: { type: Number, required: true },
		totalDueDays: { type: Number, required: true },
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.Customer ||
	mongoose.model<ICustomer>('Customer', CustomerSchema);
