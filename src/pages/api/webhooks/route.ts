import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Allow', ['POST']);
  return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
}
