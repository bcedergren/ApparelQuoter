import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { User as IUser } from '@/types/User';
import logger from '@/utils/logger';

type ClientUser = Omit<IUser, 'password' | 'rememberMe'>;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ClientUser[] | { message: string }>
) {
	logger.info(`Request method: ${req.method}`);
	logger.info(`Query parameters: ${JSON.stringify(req.query)}`);

	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		logger.warn(`Method ${req.method} Not Allowed`);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { companyId } = req.query;

	if (!companyId || !mongoose.Types.ObjectId.isValid(companyId as string)) {
		logger.error(`Invalid company ID: ${companyId}`);
		return res.status(400).json({ message: 'Invalid company ID' });
	}

	try {
		await dbConnect();
		logger.info('Connected to database');

		// Convert companyId to ObjectId
		const companyObjectId = new mongoose.Types.ObjectId(companyId as string);
		logger.info(`Converted company ID to ObjectId: ${companyObjectId}`);

		const users = await User.find({
			companyId: companyObjectId,
		});

		if (users.length === 0) {
			logger.warn(`No users found for company ID: ${companyId}`);
		} else {
			logger.info(`Fetched users count: ${users.length}`);
		}

		const transformedUsers: ClientUser[] = users.map((doc) => ({
			_id: doc._id.toString(),
			companyId: doc.companyId.toString(),
			firstName: doc.firstName,
			lastName: doc.lastName,
			email: doc.email,
			role: doc.role,
			stripeCustomerId: doc.stripeCustomerId,
			isActive: doc.isActive,
			subscriptionId: doc.subscriptionId,
		}));
		logger.info(`Transformed users: ${JSON.stringify(transformedUsers)}`);

		res.status(200).json(transformedUsers);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to fetch users:', {
				message: error.message,
				stack: error.stack,
			});
			res.status(500).json({ message: 'Failed to fetch users' });
		} else {
			logger.error('Failed to fetch users due to an unknown error');
			res
				.status(500)
				.json({ message: 'Failed to fetch users due to an unknown error' });
		}
	}
}
