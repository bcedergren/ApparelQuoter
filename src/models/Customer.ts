import mongoose, { Document, Model, Schema } from 'mongoose';

interface IFollowUpNote extends Document {
	date: Date;
	note: string;
	addedBy: mongoose.Schema.Types.ObjectId;
	addedDate: Date;
}

interface ICustomer extends Document {
	companyId: mongoose.Types.ObjectId;
	companyName: string;
	contactName: string;
	address: string;
	address2?: string;
	city: string;
	state: string;
	zip: string;
	phone: string;
	email: string;
	followUpNotes: IFollowUpNote[];
	createdBy: mongoose.Types.ObjectId;
	createdDate: Date;
}

const FollowUpNoteSchema = new mongoose.Schema({
	date: { type: Date, required: true },
	note: { type: String, required: true },
	addedBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	addedDate: { type: Date, required: true },
});

const CustomerSchema = new mongoose.Schema({
	companyId: { type: mongoose.Types.ObjectId, ref: 'Company', required: true },
	companyName: { type: String, required: true },
	contactName: { type: String, required: true },
	address: { type: String, required: true },
	address2: { type: String },
	city: { type: String, required: true },
	state: { type: String, required: true },
	zip: { type: String, required: true },
	phone: { type: String, required: true },
	email: { type: String, required: true },
	followUpNotes: { type: [FollowUpNoteSchema], default: [] },
	createdBy: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	createdDate: { type: Date, default: Date.now },
});

const Customer: Model<ICustomer> =
	mongoose.models.Customer || mongoose.model('Customer', CustomerSchema);

export default Customer;
