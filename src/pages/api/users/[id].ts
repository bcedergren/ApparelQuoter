import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import User from '@/models/User';
import { requireAuth, canModifyResource } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	// SECURITY: Require authentication
	const session = await requireAuth(req, res);
	if (!session) return;

	const { id } = req.query;

	if (!mongoose.Types.ObjectId.isValid(id as string)) {
		return res.status(400).json({ message: 'Invalid user ID' });
	}

	await dbConnect();
	const userId = new mongoose.Types.ObjectId(id as string);

	if (req.method === 'PUT') {
		const { firstName, lastName, email, role } = req.body;
		try {
			// SECURITY: First find the user to verify access
			const userToUpdate = await User.findById(userId);

			if (!userToUpdate) {
				return res.status(404).json({ message: 'User not found' });
			}

			// SECURITY: Check if user can modify this resource
			const isOwnProfile = userToUpdate._id.toString() === session.user.id;
			const isSameCompany = userToUpdate.companyId?.toString() === session.user.companyId;
			const isAdmin = session.user.role === 'admin';

			if (!isOwnProfile && !(isSameCompany && isAdmin)) {
				return res.status(403).json({ 
					message: 'Forbidden - You can only modify your own profile or users in your company (if admin)' 
				});
			}

			// SECURITY: Regular users cannot change roles
			const updateData: any = { firstName, lastName, email };
			if (isAdmin && !isOwnProfile) {
				updateData.role = role; // Only admins can change roles, and not their own
			}

			const updatedUser = await User.findByIdAndUpdate(
				userId,
				updateData,
				{ new: true }
			);

			res
				.status(200)
				.json({ message: 'User updated successfully', user: updatedUser });
		} catch (error) {
			console.error('Failed to update user:', error);
			res.status(500).json({ message: 'Failed to update user' });
		}
	} else if (req.method === 'DELETE') {
		try {
			// SECURITY: First find the user to verify access
			const userToDelete = await User.findById(userId);

			if (!userToDelete) {
				return res.status(404).json({ message: 'User not found' });
			}

			// SECURITY: Check if user can delete this resource
			const isSameCompany = userToDelete.companyId?.toString() === session.user.companyId;
			const isAdmin = session.user.role === 'admin';
			const isDeletingSelf = userToDelete._id.toString() === session.user.id;

			// Can't delete yourself, must be admin in same company
			if (isDeletingSelf) {
				return res.status(400).json({ message: 'Cannot delete your own account' });
			}

			if (!(isSameCompany && isAdmin)) {
				return res.status(403).json({ 
					message: 'Forbidden - Only admins can delete users in their company' 
				});
			}

			await User.findByIdAndDelete(userId);

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
