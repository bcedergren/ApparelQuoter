import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/utils/dbConnect';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'POST') {
		return res.status(405).end(`Method Not Allowed`);
	}

	const { db, client } = await connectToDatabase();
	const customerData = req.body;

	try {
		const result = await db.collection('Customer').insertOne(customerData);
		const customer = await db
			.collection('Customer')
			.findOne({ _id: result.insertedId });

		if (customer) {
			res.status(201).json(customer);
		} else {
			res.status(404).json({ message: 'Customer not found after insertion.' });
		}
	} catch (error) {
		console.error('Failed to add customer:', error);
		res.status(500).json({ message: 'Failed to add customer' });
	} finally {
		await client.close();
	}
}
