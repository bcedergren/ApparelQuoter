import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { User as IUser } from '@/types/User';

type ClientUser = Omit<IUser, 'password' | 'rememberMe'>;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ClientUser[] | { message: string }>
) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { companyId } = req.query;

	if (!companyId || !mongoose.Types.ObjectId.isValid(companyId as string)) {
		return res.status(400).json({ message: 'Invalid company ID' });
	}

	await dbConnect();

	try {
		const users = await User.find({
			companyId: new mongoose.Types.ObjectId(companyId as string),
		});

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

		res.status(200).json(transformedUsers);
	} catch (error) {
		console.error('Failed to fetch users:', error);
		res.status(500).json({ message: 'Failed to fetch users' });
	}
}
