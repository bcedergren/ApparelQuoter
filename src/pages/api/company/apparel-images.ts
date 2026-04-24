import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import formidable from 'formidable';
import fs from 'fs';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Company from '@/models/Company';

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

	await dbConnect();

	const companyId = (session.user as any).companyId;
	if (!companyId || !mongoose.Types.ObjectId.isValid(companyId)) {
		return res.status(400).json({ message: 'Invalid company ID' });
	}

	const company = await Company.findById(companyId);
	if (!company) {
		return res.status(404).json({ message: 'Company not found' });
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
			const bucket = new (mongoose as any).mongo.GridFSBucket(conn.db, { bucketName: 'company_apparel_images' });

			const originalName = file.originalFilename || 'upload';
			const contentType = file.mimetype || 'application/octet-stream';

			const readStream = fs.createReadStream(file.filepath);
			const uploadStream = bucket.openUploadStream(originalName, {
				metadata: { contentType, companyId },
			});

			await new Promise<void>((resolve, reject) => {
				readStream
					.on('error', reject)
					.pipe(uploadStream)
					.on('error', reject)
					.on('finish', () => resolve());
			});

			const fileId = uploadStream.id as mongoose.Types.ObjectId;
			console.log('Upload completed, fileId:', fileId.toString());
			console.log('Company before update:', { id: company._id, apparelImages: company.apparelImages });
			
			company.apparelImages = company.apparelImages || [];
			const newImageRef = {
				fileId: fileId,
				filename: originalName,
				displayName: originalName,
				contentType,
				length: typeof file.size === 'number' ? file.size : undefined,
				uploadDate: new Date(),
			};
			
			console.log('Adding image reference:', newImageRef);
			company.apparelImages.push(newImageRef);
			
			console.log('Company after adding image:', { id: company._id, apparelImagesCount: company.apparelImages.length });
			
			const saveResult = await company.save();
			console.log('Company saved successfully:', { id: saveResult._id, apparelImagesCount: saveResult.apparelImages.length });

			// Stringify fileIds for frontend
			const apparelImagesResponse = company.apparelImages.map((img: any) => ({
				...img.toObject ? img.toObject() : img,
				fileId: img.fileId.toString(),
			}));

			return res.status(200).json({
				message: 'Image uploaded',
				apparelImages: apparelImagesResponse,
			});
		} catch (error) {
			console.error('Error uploading apparel image:', error);
			return res.status(500).json({ message: 'Failed to upload image' });
		}
	} else if (req.method === 'DELETE') {
		try {
			const { fileId } = (req.body || {}) as { fileId?: string };
			if (!fileId || !mongoose.Types.ObjectId.isValid(fileId)) {
				return res.status(400).json({ message: 'Invalid fileId' });
			}

			const fileIdObj = new mongoose.Types.ObjectId(fileId);
			const existing = (company.apparelImages || []).find((f: any) => f.fileId.toString() === fileIdObj.toString());
			if (!existing) {
				return res.status(404).json({ message: 'Image not found on company' });
			}

			const conn = mongoose.connection;
			const bucket = new (mongoose as any).mongo.GridFSBucket(conn.db, { bucketName: 'company_apparel_images' });

			await new Promise<void>((resolve, reject) => {
				bucket.delete(fileIdObj, (err: any) => (err ? reject(err) : resolve()));
			});

			company.apparelImages = (company.apparelImages || []).filter((f: any) => f.fileId.toString() !== fileIdObj.toString());
			await company.save();

			// Stringify fileIds for frontend
			const apparelImagesResponse = company.apparelImages.map((img: any) => ({
				...img.toObject ? img.toObject() : img,
				fileId: img.fileId.toString(),
			}));

			return res.status(200).json({ message: 'Image deleted', apparelImages: apparelImagesResponse });
		} catch (error) {
			console.error('Error deleting apparel image:', error);
			return res.status(500).json({ message: 'Failed to delete image' });
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
			const imageIndex = (company.apparelImages || []).findIndex((f: any) => f.fileId.toString() === fileIdObj.toString());
			if (imageIndex === -1) {
				return res.status(404).json({ message: 'Image not found on company' });
			}

			company.apparelImages[imageIndex].displayName = displayName;
			await company.save();

			// Stringify fileIds for frontend
			const apparelImagesResponse = company.apparelImages.map((img: any) => ({
				...img.toObject ? img.toObject() : img,
				fileId: img.fileId.toString(),
			}));

			return res.status(200).json({ message: 'Image renamed', apparelImages: apparelImagesResponse });
		} catch (error) {
			console.error('Error renaming apparel image:', error);
			return res.status(500).json({ message: 'Failed to rename image' });
		}
	} else {
		res.setHeader('Allow', ['POST', 'DELETE', 'PUT']);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}
}


