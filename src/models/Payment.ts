import mongoose, { Schema, Document } from 'mongoose';

export interface IPayment extends Document {
	amount: number;
	date: Date;
	customerId: mongoose.Schema.Types.ObjectId;
	orderId: mongoose.Schema.Types.ObjectId;
}

const PaymentSchema: Schema = new Schema({
	amount: { type: Number, required: true },
	date: { type: Date, default: Date.now },
	customerId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Customer',
		required: true,
	},
	orderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
		required: true,
	},
});

export default mongoose.models.Payment ||
	mongoose.model<IPayment>('Payment', PaymentSchema);
