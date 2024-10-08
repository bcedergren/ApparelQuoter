import mongoose, { Schema, Document } from 'mongoose';

export interface ISale extends Document {
	orderId: mongoose.Types.ObjectId;
	companyId: mongoose.Types.ObjectId;
	salesPersonId: mongoose.Types.ObjectId;
	saleDate: Date;
	totalAmount: number;
}

const SaleSchema: Schema = new Schema({
	orderId: { type: mongoose.Schema.Types.ObjectId, required: true },
	companyId: { type: mongoose.Schema.Types.ObjectId, required: true },
	salesPersonId: { type: mongoose.Schema.Types.ObjectId, required: true },
	saleDate: { type: Date, required: true },
	totalAmount: { type: Number, required: true },
});

export default mongoose.models.Sale ||
	mongoose.model<ISale>('Sale', SaleSchema);
