import type { NextApiRequest, NextApiResponse } from 'next';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/pages/api/auth/[...nextauth]';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const allowedExtensionsByMime: Record<string, string[]> = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/svg+xml': ['.svg'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
  'application/postscript': ['.ps', '.eps'],
  'image/x-eps': ['.eps'],
  'application/eps': ['.eps'],
  'application/x-eps': ['.eps'],
  'image/eps': ['.eps'],
  'application/illustrator': ['.ai'],
  'application/x-illustrator': ['.ai'],
  'image/vnd.adobe.illustrator': ['.ai'],
  'application/photoshop': ['.psd'],
  'application/x-photoshop': ['.psd'],
  'image/vnd.adobe.photoshop': ['.psd']
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);

  if (!session || !session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Create uploads directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'designs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 50 * 1024 * 1024, // 50MB limit
      filter: ({ mimetype }) => {
        // Allow common image and design file types
        return Boolean(mimetype && allowedExtensionsByMime[mimetype]);
      }
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate unique filename
    const mimeType = file.mimetype || '';
    const sourceExtension = path.extname(file.originalFilename || '').toLowerCase();
    const allowedExtensions = allowedExtensionsByMime[mimeType] || [];
    const fileExtension = allowedExtensions.includes(sourceExtension)
      ? sourceExtension
      : allowedExtensions[0];

    if (!fileExtension) {
      return res.status(400).json({ message: 'Unsupported or unsafe file type' });
    }
    const uniqueFilename = `${uuidv4()}${fileExtension}`;
    const newPath = path.join(uploadDir, uniqueFilename);

    // Move file to final location
    fs.renameSync(file.filepath, newPath);

    // Return file information
    const fileInfo = {
      fileName: file.originalFilename,
      fileUrl: `/uploads/designs/${uniqueFilename}`,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date()
    };

    res.status(200).json({
      message: 'File uploaded successfully',
      file: fileInfo
    });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Failed to upload file' });
  }
}
