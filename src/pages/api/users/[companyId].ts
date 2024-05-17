import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';
import { User } from '@/types/User';

type ClientUser = Omit<User, 'password' | 'rememberMe'>;

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ClientUser[] | { message: string }>
) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { companyId } = req.query;

	const { db } = await connectToDatabase();

	try {
		const users = await db
			.collection('User')
			.find({ companyId: new ObjectId(companyId as string) })
			.toArray();

		const transformedUsers: ClientUser[] = users.map((doc) => ({
			_id: doc._id.toString(),
			companyId: doc.companyId.toString(),
			firstName: doc.firstName,
			lastName: doc.lastName,
			email: doc.email,
			role: doc.role,
		}));

		res.status(200).json(transformedUsers);
	} catch (error) {
		console.error('Failed to fetch users:', error);
		res.status(500).json({ message: 'Failed to fetch users' });
	}
}
