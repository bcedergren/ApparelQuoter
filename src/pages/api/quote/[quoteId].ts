import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';
import { requireAuth, verifyResourceOwnership } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { method } = req;
	const { quoteId } = req.query;

	if (
		!quoteId ||
		typeof quoteId !== 'string' ||
		!mongoose.Types.ObjectId.isValid(quoteId)
	) {
		return res.status(400).json({ message: 'Invalid quote ID provided' });
	}

	// SECURITY: Require authentication
	const session = await requireAuth(req, res);
	if (!session) return;

	await dbConnect();

	if (method === 'GET') {
		try {
			const quote = await Quote.findById(quoteId).exec();

			if (!quote) {
				return res.status(404).json({ message: 'Quote not found' });
			}

			// SECURITY: Verify quote belongs to user's company
			if (!verifyResourceOwnership(quote.companyId?.toString(), session.user.companyId, res)) {
				return;
			}

			res.status(200).json(quote);
		} catch (error) {
			console.error('Error fetching quote:', error);
			res.status(500).json({ message: 'Failed to fetch quote details' });
		}
	} else if (method === 'DELETE') {
		try {
			// SECURITY: First verify ownership before deleting
			const quote = await Quote.findById(quoteId).exec();

			if (!quote) {
				return res.status(404).json({ message: 'Quote not found' });
			}

			// SECURITY: Verify quote belongs to user's company
			if (!verifyResourceOwnership(quote.companyId?.toString(), session.user.companyId, res)) {
				return;
			}

			await Quote.findByIdAndDelete(quoteId).exec();
			res.status(200).json({ message: 'Quote successfully deleted' });
		} catch (error) {
			console.error('Error deleting quote:', error);
			res.status(500).json({ message: 'Failed to delete quote' });
		}
	} else {
		// Handle any other HTTP methods
		res.setHeader('Allow', ['GET', 'DELETE']);
		res.status(405).end(`Method ${method} Not Allowed`);
	}
}
