import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IPlan extends Document {
	name: string;
	planId: string;
	price: number;
	users: number;
	clients: number;
}

const PlanSchema: Schema<IPlan> = new Schema({
	name: { type: String, required: true },
	planId: { type: String, required: true },
	price: { type: Number, required: true },
	users: { type: Number, required: true },
	clients: { type: Number, required: true },
});

const Plan: Model<IPlan> =
	mongoose.models.Plan || mongoose.model<IPlan>('Plan', PlanSchema);
export default Plan;
