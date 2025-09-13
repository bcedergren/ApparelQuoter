import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getSession({ req });

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
        const allowedTypes = [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/svg+xml',
          'image/webp',
          'application/pdf',
          'application/illustrator',
          'application/photoshop',
          'application/x-photoshop',
          'image/vnd.adobe.photoshop',
          'application/postscript',
          'image/x-eps',
          'application/eps',
          'application/x-eps',
          'image/eps',
          'application/illustrator',
          'application/x-illustrator',
          'image/vnd.adobe.illustrator'
        ];
        return allowedTypes.includes(mimetype || '');
      }
    });

    const [fields, files] = await form.parse(req);

    const file = Array.isArray(files.file) ? files.file[0] : files.file;
    
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalFilename || '');
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
