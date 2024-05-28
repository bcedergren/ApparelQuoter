import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';
import { ObjectId } from 'mongodb';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (!ObjectId.isValid(id as string)) {
		return res.status(400).json({ message: 'Invalid user ID' });
	}

	const { db } = await connectToDatabase();
	const userId = new ObjectId(id as string);

	if (req.method === 'PUT') {
		const { firstName, lastName, email, role } = req.body;
		try {
			await db.collection('User').updateOne(
				{ _id: userId },
				{
					$set: { firstName, lastName, email, role },
				}
			);
			res.status(200).json({ message: 'User updated successfully' });
		} catch (error) {
			console.error('Failed to update user:', error);
			res.status(500).json({ message: 'Failed to update user' });
		}
	} else if (req.method === 'DELETE') {
		try {
			await db.collection('User').deleteOne({ _id: userId });
			res.status(200).json({ message: 'User deleted successfully' });
		} catch (error) {
			console.error('Failed to delete user:', error);
			res.status(500).json({ message: 'Failed to delete user' });
		}
	} else {
		res.setHeader('Allow', ['PUT', 'DELETE']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
