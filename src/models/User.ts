import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
	companyId: string;
	firstName: string;
	lastName: string;
	email: string;
	password: string; // Hashed password
	role: string;
	rememberMe: boolean;
	resetToken?: string;
	resetTokenExpiry?: number;
	stripeCustomerId: string;
	isActive: boolean;
	subscriptionId: string;
	subscriptionStatus?: 'active' | 'canceled' | 'past_due' | 'unpaid' | 'incomplete' | 'trialing';
	paymentStatus?: 'succeeded' | 'failed' | 'pending';
}

const UserSchema: Schema = new Schema(
	{
		companyId: { type: String, required: true },
		firstName: { type: String, required: true },
		lastName: { type: String, required: true },
		email: { type: String, required: true, unique: true },
		password: { type: String },
		role: { type: String, required: true },
		rememberMe: { type: Boolean },
		resetToken: { type: String },
		resetTokenExpiry: { type: Number },
		stripeCustomerId: { type: String },
		isActive: { type: Boolean, required: true },
		subscriptionId: { type: String, required: true },
		subscriptionStatus: {
			type: String,
			enum: ['active', 'canceled', 'past_due', 'unpaid', 'incomplete', 'trialing'],
			required: false,
		},
		paymentStatus: {
			type: String,
			enum: ['succeeded', 'failed', 'pending'],
			required: false,
		},
	},
	{
		timestamps: true,
	}
);

export default mongoose.models.User ||
	mongoose.model<IUser>('User', UserSchema);
