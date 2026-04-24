import mongoose from 'mongoose';
import type { NextApiRequest, NextApiResponse } from 'next';
import Customer from '@/models/Customer';
import dbConnect from '@/utils/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';

async function handlePost(
	req: NextApiRequest,
	res: NextApiResponse,
	userId: string
) {
	const { customerId, note } = req.body;

	try {
		await dbConnect();

		const customer = await Customer.findById(customerId);

		if (!customer) {
			return res.status(404).json({ message: 'Customer not found' });
		}

		// Create a new follow-up note using the schema constructor
		const newNote = {
			date: new Date(),
			note: note,
			addedBy: new mongoose.Types.ObjectId(userId),
			addedDate: new Date(),
		};

		customer.followUpNotes.push(newNote as any);
		await customer.save();

		res.status(201).json({ message: 'Note added successfully' });
	} catch (error) {
		console.error('Error adding note:', error);
		res.status(500).json({ message: 'Error adding note' });
	}
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);

	if (!session || !session.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	if (req.method === 'POST') {
		return handlePost(req, res, session.user.id);
	} else {
		res.setHeader('Allow', ['POST']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
