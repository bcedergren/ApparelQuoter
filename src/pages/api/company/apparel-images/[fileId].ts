import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Company from '@/models/Company';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session || !session.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const { fileId } = req.query as { fileId?: string };
	const companyId = (session.user as any).companyId as string | undefined;
	if (!fileId || !mongoose.Types.ObjectId.isValid(fileId) || !companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
		return res.status(400).json({ message: 'Invalid parameters' });
	}

	await dbConnect();

	const company = await Company.findById(companyId);
	if (!company) {
		return res.status(404).json({ message: 'Company not found' });
	}

	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	try {
		const conn = mongoose.connection;
		const bucket = new (mongoose as any).mongo.GridFSBucket(conn.db, { bucketName: 'company_apparel_images' });
		const idObj = new mongoose.Types.ObjectId(fileId);

		console.log('Streaming request for fileId:', fileId);
		console.log('Company apparelImages:', company.apparelImages);

		const ref = (company.apparelImages || []).find((f: any) => f.fileId.toString() === idObj.toString());
		if (!ref) {
			console.log('File reference not found in company.apparelImages');
			return res.status(404).json({ message: 'File not found in company records' });
		}

		console.log('Found file reference:', ref);

		// Check if file exists in GridFS
		try {
			const files = await bucket.find({ _id: idObj }).toArray();
			if (files.length === 0) {
				console.log('File not found in GridFS');
				return res.status(404).json({ message: 'File not found in GridFS' });
			}
			console.log('File found in GridFS:', files[0]);
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
		console.error('Error streaming apparel image:', error);
		return res.status(500).json({ message: 'Failed to stream file' });
	}
}


