import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import formidable from 'formidable';
import fs from 'fs';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Customer from '@/models/Customer';

export const config = {
	api: {
		bodyParser: false,
	},
};

const ALLOWED_IMAGE_TYPES = [
	'image/jpeg',
	'image/png',
	'image/gif',
	'image/webp',
	'image/svg+xml',
];

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const session = await getServerSession(req, res, authOptions);
	if (!session || !session.user) {
		return res.status(401).json({ message: 'Unauthorized' });
	}

	const { customerId } = req.query;
	if (!customerId || typeof customerId !== 'string' || !mongoose.Types.ObjectId.isValid(customerId)) {
		return res.status(400).json({ message: 'Invalid customer ID' });
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

	if (req.method === 'POST') {
		try {
			const form = formidable({
				keepExtensions: true,
				maxFileSize: 50 * 1024 * 1024,
				filter: ({ mimetype }) => ALLOWED_IMAGE_TYPES.includes(mimetype || ''),
			});

			const [, files] = await form.parse(req);
			const file = Array.isArray(files.file) ? files.file[0] : (files.file as any);
			if (!file) {
				return res.status(400).json({ message: 'No file uploaded' });
			}

			const conn = mongoose.connection;
			const bucket = new (mongoose as any).mongo.GridFSBucket(conn.db, { bucketName: 'customer_logos' });

			const originalName = file.originalFilename || 'upload';
			const contentType = file.mimetype || 'application/octet-stream';

			const readStream = fs.createReadStream(file.filepath);
			const uploadStream = bucket.openUploadStream(originalName, {
				metadata: { contentType, customerId },
			});

			await new Promise<void>((resolve, reject) => {
				readStream
					.on('error', reject)
					.pipe(uploadStream)
					.on('error', reject)
					.on('finish', () => resolve());
			});

			const fileId = uploadStream.id as mongoose.Types.ObjectId;
			customer.logoFiles = customer.logoFiles || [];
			customer.logoFiles.push({
				fileId: fileId,
				filename: originalName,
				displayName: originalName,
				contentType,
				length: typeof file.size === 'number' ? file.size : undefined,
				uploadDate: new Date(),
			});
			await customer.save();

			// Stringify fileIds for frontend
			const logoFilesResponse = customer.logoFiles!.map((logo: any) => ({
				...logo.toObject ? logo.toObject() : logo,
				fileId: logo.fileId.toString(),
			}));

			return res.status(200).json({
				message: 'Logo uploaded',
				logoFiles: logoFilesResponse,
			});
		} catch (error) {
			console.error('Error uploading customer logo:', error);
			return res.status(500).json({ message: 'Failed to upload logo' });
		}
	} else if (req.method === 'DELETE') {
		try {
			// Manually parse JSON for DELETE since bodyParser is disabled
			let body = '';
			req.on('data', chunk => body += chunk);
			await new Promise(resolve => req.on('end', resolve));
			const { fileId } = JSON.parse(body || '{}') as { fileId?: string };
			
			if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
				return res.status(400).json({ message: 'Invalid fileId' });
			}

			const fileIdObj = new mongoose.Types.ObjectId(fileId);
			const existing = (customer.logoFiles || []).find((f: any) => f.fileId.toString() === fileIdObj.toString());
			if (!existing) {
				return res.status(404).json({ message: 'Logo not found on customer' });
			}

			const conn = mongoose.connection;
			const bucket = new (mongoose as any).mongo.GridFSBucket(conn.db, { bucketName: 'customer_logos' });

			await new Promise<void>((resolve, reject) => {
				bucket.delete(fileIdObj, (err: any) => (err ? reject(err) : resolve()));
			});

			customer.logoFiles = (customer.logoFiles || []).filter((f: any) => f.fileId.toString() !== fileIdObj.toString());
			await customer.save();

			// Stringify fileIds for frontend
			const logoFilesResponse = customer.logoFiles!.map((logo: any) => ({
				...logo.toObject ? logo.toObject() : logo,
				fileId: logo.fileId.toString(),
			}));

			return res.status(200).json({ message: 'Logo deleted', logoFiles: logoFilesResponse });
		} catch (error) {
			console.error('Error deleting customer logo:', error);
			return res.status(500).json({ message: 'Failed to delete logo' });
		}
	} else if (req.method === 'PUT') {
		try {
			// Manually parse JSON for PUT since bodyParser is disabled
			let body = '';
			req.on('data', chunk => body += chunk);
			await new Promise(resolve => req.on('end', resolve));
			const { fileId, displayName } = JSON.parse(body) as { fileId?: string; displayName?: string };
			
			if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
				return res.status(400).json({ message: 'Invalid fileId' });
			}
			if (!displayName || typeof displayName !== 'string') {
				return res.status(400).json({ message: 'displayName is required' });
			}

			const fileIdObj = new mongoose.Types.ObjectId(fileId);
			const logoIndex = (customer.logoFiles || []).findIndex((f: any) => f.fileId.toString() === fileIdObj.toString());
			if (logoIndex === -1) {
				return res.status(404).json({ message: 'Logo not found on customer' });
			}

			customer.logoFiles![logoIndex].displayName = displayName;
			await customer.save();

			// Stringify fileIds for frontend
			const logoFilesResponse = customer.logoFiles!.map((logo: any) => ({
				...logo.toObject ? logo.toObject() : logo,
				fileId: logo.fileId.toString(),
			}));

			return res.status(200).json({ message: 'Logo renamed', logoFiles: logoFilesResponse });
		} catch (error) {
			console.error('Error renaming customer logo:', error);
			return res.status(500).json({ message: 'Failed to rename logo' });
		}
	} else {
		res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}
