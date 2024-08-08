import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Price from '@/models/Price';
import logger from '@/utils/logger';
import formatFields from '@/utils/formatFields';

// Fields to be formatted with 2 decimal places
const fieldsToFormat = [
	'firstColor',
	'additionalColor',
	'flatFee',
	'inkChargesPerPiece',
	'glitterOrPuff',
	'colorMatch',
	'inkColorChanges',
	'lessThan',
	'betweenStart',
	'betweenEnd',
	'andOrLessThan',
	'andOrBetween',
	'andOrOver',
	'over',
	'1 color',
	'2 colors',
	'3 colors',
	'4 colors',
	'5 colors',
	'6 colors',
	'7 colors',
	'8 colors',
	'9 colors',
	'10 colors',
	'11 colors',
	'12 colors',
	'small',
	'medium',
	'large',
	'names',
	'numbers',
	'costPerFirst5000Stitches',
	'costPerThousandStitches',
	'hoopingFee',
];

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end('Method Not Allowed');
	}

	const { companyId } = req.query;

	if (!companyId || !mongoose.Types.ObjectId.isValid(companyId as string)) {
		return res
			.status(400)
			.json({ success: false, message: 'Invalid company ID' });
	}

	await dbConnect();

	try {
		const objectId = new mongoose.Types.ObjectId(companyId as string);
		const prices = await Price.findOne({ companyId: objectId });

		logger.info('Fetched prices');

		if (!prices) {
			return res.status(200).json({ success: true, prices });
		}

		// Convert the prices document to a plain object
		const pricesObj = prices.toObject();

		// Format the prices data
		formatFields(pricesObj, fieldsToFormat, 2);

		res.status(200).json({ success: true, prices: pricesObj });
	} catch (error) {
		logger.error('Failed to fetch prices:', error);
		res.status(500).json({ success: false, message: 'Failed to fetch prices' });
	}
}
