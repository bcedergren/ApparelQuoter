import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<{ quotes: any[] } | { message: string }>
) {
	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { companyId, quoteType } = req.query;
	const { db, client } = await connectToDatabase();

	try {
		// Construct the query based on provided parameters
		const query: any = { companyId: companyId };
		if (quoteType) {
			query.quoteType = quoteType;
		}

		const quotes = await db.collection('Quotes').find(query).toArray();
		const transformedQuotes = quotes.map((doc) => ({
			...doc,
			_id: doc._id.toString(), // Convert ObjectId to string
			companyId: doc.companyId,
			// Include other fields as needed
		}));

		res.status(200).json({ quotes: transformedQuotes });
	} catch (error) {
		console.error('Failed to fetch quotes:', error);
		res.status(500).json({ message: 'Failed to fetch quotes' });
	} finally {
		await client.close();
	}
}
