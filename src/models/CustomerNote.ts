import mongoose, { Document, Schema } from 'mongoose';

interface ICustomerNote extends Document {
	customerId: mongoose.Schema.Types.ObjectId;
	note: string;
	createdAt: Date;
	createdBy: mongoose.Schema.Types.ObjectId;
}

const CustomerNoteSchema = new Schema<ICustomerNote>({
	customerId: { type: Schema.Types.ObjectId, ref: 'Customer', required: true },
	note: { type: String, required: true },
	createdAt: { type: Date, default: Date.now },
	createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default mongoose.models.CustomerNote ||
	mongoose.model<ICustomerNote>('CustomerNote', CustomerNoteSchema);
