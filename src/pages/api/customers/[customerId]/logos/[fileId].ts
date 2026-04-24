import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session || !session.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const { customerId, fileId } = req.query as { customerId?: string; fileId?: string };
	if (!customerId || !mongoose.Types.ObjectId.isValid(customerId) || !fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
		return res.status(400).json({ message: 'Invalid parameters' });
	}

	await dbConnect();

	const companyId = (session.user as any).companyId;
	const customer = await Customer.findOne({
		_id: new mongoose.Types.ObjectId(customerId),
		companyId: new mongoose.Types.ObjectId(companyId),
	});
	if (!customer) {
		return res.status(404).json({ message: 'Customer not found' });
	}

	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	try {
		const conn = mongoose.connection;
		const bucket = new (mongoose as any).mongo.GridFSBucket(conn.db, { bucketName: 'customer_logos' });
		const idObj = new mongoose.Types.ObjectId(fileId);

		console.log('Streaming customer logo for fileId:', fileId);
		console.log('Customer logoFiles:', customer.logoFiles);

		// Ensure the file is referenced by this customer
		const ref = (customer.logoFiles || []).find((f: any) => f.fileId.toString() === idObj.toString());
		if (!ref) {
			console.log('File reference not found in customer.logoFiles');
			return res.status(404).json({ message: 'File not found in customer records' });
		}

		console.log('Found logo reference:', ref);

		// Check if file exists in GridFS
		try {
			const files = await bucket.find({ _id: idObj }).toArray();
			if (files.length === 0) {
				console.log('Logo file not found in GridFS');
				return res.status(404).json({ message: 'File not found in GridFS' });
			}
			console.log('Logo file found in GridFS:', files[0]);
		} catch (gridError) {
			console.error('GridFS find error:', gridError);
			return res.status(500).json({ message: 'GridFS lookup failed' });
		}

		res.setHeader('Content-Type', ref.contentType || 'application/octet-stream');
		res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
		const downloadStream = bucket.openDownloadStream(idObj);
		downloadStream.on('error', (err: Error) => {
			console.error('GridFS download stream error:', err);
			if (!res.headersSent) {
				res.status(404).end();
			}
		});
		downloadStream.pipe(res);
	} catch (error) {
		console.error('Error streaming customer logo:', error);
		return res.status(500).json({ message: 'Failed to stream file' });
	}
}
