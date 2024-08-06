import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { id } = req.query;

	if (!mongoose.Types.ObjectId.isValid(id as string)) {
		return res.status(400).json({ message: 'Invalid user ID' });
	}

	await dbConnect();
	const userId = new mongoose.Types.ObjectId(id as string);

	if (req.method === 'PUT') {
		const { firstName, lastName, email, role } = req.body;
		try {
			const updatedUser = await User.findByIdAndUpdate(
				userId,
				{ firstName, lastName, email, role },
				{ new: true }
			);

			if (!updatedUser) {
				return res.status(404).json({ message: 'User not found' });
			}

			res
				.status(200)
				.json({ message: 'User updated successfully', user: updatedUser });
		} catch (error) {
			console.error('Failed to update user:', error);
			res.status(500).json({ message: 'Failed to update user' });
		}
	} else if (req.method === 'DELETE') {
		try {
			const deletedUser = await User.findByIdAndDelete(userId);

			if (!deletedUser) {
				return res.status(404).json({ message: 'User not found' });
			}

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
