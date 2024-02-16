import type { NextApiRequest, NextApiResponse } from 'next';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import { connectToDatabase } from '@/utils/dbConnect';

const client = new MongoClient(process.env.MONGODB_URI as string);

type UserData = {
	companyName: string;
	email: string;
	password: string;
	[key: string]: any; // Extend this type based on the other fields you expect
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
	if (req.method === 'POST') {
		const { companyName, email, password, ...companyDetails }: UserData =
			req.body;

		const db = await connectToDatabase();
		const existingUser = await db.collection('User').findOne({ Email: email });

		if (existingUser) {
			res.status(422).json({ message: 'User already exists!' });
			await client.close();
			return;
		}

		const hashedPassword = await bcrypt.hash(password, 12);

		const companyResult = await db
			.collection('Company')
			.insertOne({ Name: companyName, ...companyDetails });
		const companyId = companyResult.insertedId; // Capture the insertedId from the companyResult

		const userResult = await db.collection('User').insertOne({
			CompanyId: companyId, // Save the CompanyId from the company document
			Email: email,
			Password: hashedPassword,
			CreatedAt: new Date(),
			UpdatedAt: new Date(),
		});

		res.status(201).json({ message: 'User created!' });
		await client.close();
	} else {
		res.setHeader('Allow', ['POST']);
		res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}

export default handler;
