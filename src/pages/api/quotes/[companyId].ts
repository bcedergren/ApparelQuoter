import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Quote from '@/models/Quote';
import { requireCompanyAccess } from '@/lib/auth';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<{ quotes: any[] } | { message: string }>
) {
	const { method } = req;
	const { companyId, quoteType } = req.query;

	if (method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${method} Not Allowed`);
	}

	if (
		!companyId ||
		typeof companyId !== 'string' ||
		!mongoose.Types.ObjectId.isValid(companyId)
	) {
		return res.status(400).json({ message: 'Invalid company ID provided' });
	}

	// SECURITY: Require authentication and verify company access
	const session = await requireCompanyAccess(req, res, companyId);
	if (!session) return;

	await dbConnect();

	try {
		// Use authenticated user's companyId to prevent enumeration
		const query: any = { companyId: new mongoose.Types.ObjectId(session.user.companyId) };
		if (quoteType) {
			query.quoteType = quoteType;
		}

		const quotes = await Quote.find(query).exec();
		const transformedQuotes = quotes.map((doc) => ({
			...doc.toObject(),
			_id: doc._id.toString(), // Convert ObjectId to string
			companyId: doc.companyId?.toString(),
			// Include other fields as needed
		}));

		res.status(200).json({ quotes: transformedQuotes });
	} catch (error) {
		console.error('Failed to fetch quotes:', error);
		res.status(500).json({ message: 'Failed to fetch quotes' });
	}
}
