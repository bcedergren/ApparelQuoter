import type { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '@/lib/password';
import dbConnect from '@/utils/dbConnect';
import stripe from '@/lib/stripeServer';
import User from '@/models/User';
import Company from '@/models/Company';
import Price from '@/models/Price';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	const { email, password, firstName, lastName, companyName, planId } =
		req.body;

	if (!planId) {
		return res.status(400).json({ error: 'Plan ID is required' });
	}

	try {
		await dbConnect();

		console.log('Checking for existing user...');
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			console.log('User already exists');
			return res.status(409).json({ error: 'User already exists' });
		}

		let hashedPassword = null;
		if (password) {
			console.log('Hashing password...');
			hashedPassword = await hashPassword(password);
		}

		console.log('Creating Stripe customer...');
		const customer = await stripe.customers.create({
			email,
			name: `${firstName} ${lastName}`,
		});

		console.log('Creating Stripe subscription...');
		const subscription = await stripe.subscriptions.create({
			customer: customer.id,
			items: [{ price: planId }],
			trial_period_days: 7,
		});

		console.log('Creating company...');
		const newCompany = new Company({
			name: companyName,
			createdBy: email,
		});

		console.log('Creating default prices...');
		await Price.create({
			CompanyId: newCompany._id,
			artCost: {
				firstColor: '0',
				additionalColor: '0',
				flatFee: '0',
				inkMarkup: '0',
				inkChargesPerPiece: '0',
				glitterOrPuff: '0',
				colorMatch: '0',
				inkColorChanges: '0',
				dtgDarkGarmentMarkup: '0',
				flashMarkup: '0',
			},
			wholesaleMarkup: {
				lessThan: '0',
				betweenStart: '0',
				betweenEnd: '0',
				over: '0',
				markupLessThan: '0',
				markupBetween: '0',
				markupOver: '0',
				andOrLessThan: '0',
				andOrBetween: '0',
				andOrOver: '0',
			},
			printingQuantityRanges: [
				{ start: '0', end: '0' },
				{ start: '0', end: '0' },
				{ start: '0', end: '0' },
				{ start: '0', end: '0' },
				{ start: '0', end: '0' },
				{ start: '0', end: '0' },
				{ start: '0', end: '0' },
			],
			printingLocationNames: ['-', '-', '-', '-'],
			screenPrinting: {
				'1 color': ['0', '0', '0', '0', '0', '0', '0'],
				'2 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'3 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'4 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'5 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'6 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'7 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'8 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'9 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'10 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'11 colors': ['0', '0', '0', '0', '0', '0', '0'],
				'12 colors': ['0', '0', '0', '0', '0', '0', '0'],
				perScreenNew: '0',
				perScreenExisting: '0',
			},
			dtgPrinting: {
				small: ['', '', '', '', '', '', ''],
				medium: ['', '', '', '', '', '', ''],
				large: ['', '', '', '', '', '', ''],
			},
			dtgDarkGarmentMarkup: {
				small: ['', '', '', '', '', '', ''],
				medium: ['', '', '', '', '', '', ''],
				large: ['', '', '', '', '', '', ''],
			},
			dyeSublimation: {
				small: ['', '', '', '', '', '', ''],
				medium: ['', '', '', '', '', '', ''],
				large: ['', '', '', '', '', '', ''],
			},
			preCutVinyl: {
				names: ['-', '-', '-', '-', '-', '-', '-'],
				numbers: ['0', '0', '0', '0', '0', '0', '0'],
			},
			embroidery: {
				stitchCount: '0',
				costPerThousandStitches: '0',
				hoopingFee: '0',
				costPerFirst5000Stitches: '0',
			},
		});

		const companyResult = await newCompany.save();
		const companyId = companyResult._id;

		console.log('Creating user...');
		const newUser = new User({
			email,
			password: hashedPassword,
			firstName,
			lastName,
			companyId,
			stripeCustomerId: customer.id,
			subscriptionId: subscription.id,
			isActive: true,
			role: 'admin',
		});

		const userResult = await newUser.save();

		console.log('User created successfully');
		res.status(201).json({
			userId: userResult._id,
			stripeCustomerId: customer.id,
			subscriptionId: subscription.id,
		});
	} catch (error) {
		console.error('Error occurred:', error);
		const errorMessage =
			error instanceof Error ? error.message : 'An unknown error occurred';
		res.status(500).json({ error: errorMessage });
	}
}
