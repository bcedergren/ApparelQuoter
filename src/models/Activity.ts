import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema({
	orderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Order',
		required: true,
	},
	companyId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Company',
		required: true,
	}, // Company ID
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
	}, // User ID who made the update
	activityType: { type: String, required: true },
	message: { type: String, required: true },
	timestamp: { type: Date, required: true },
});

const Activity =
	mongoose.models.Activity || mongoose.model('Activity', ActivitySchema);
export default Activity;
