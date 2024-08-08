import type { NextApiRequest, NextApiResponse } from 'next';
import { hashPassword } from '@/lib/password';
import dbConnect from '@/utils/dbConnect';
import stripe from '@/lib/stripe';
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
			CompanyId: new mongoose.Types.ObjectId(newCompany._id),
			artCost: {
				firstColor: '',
				additionalColor: '',
				flatFee: '',
				inkMarkup: '',
				inkChargesPerPiece: '',
				glitterOrPuff: '',
				colorMatch: '',
				inkColorChanges: '',
			},
			wholesaleMarkup: {
				lessThan: '',
				betweenStart: '',
				betweenEnd: '',
				over: '',
				markupLessThan: '',
				markupBetween: '',
				markupOver: '',
				andOrLessThan: '',
				andOrBetween: '',
				andOrOver: '',
			},
			printingQuantityRanges: [
				{ start: '', end: '' },
				{ start: '', end: '' },
				{ start: '', end: '' },
				{ start: '', end: '' },
				{ start: '', end: '' },
				{ start: '', end: '' },
				{ start: '', end: '' },
			],
			printingLocationNames: ['', '', '', ''],
			screenPrinting: {
				'1 color': ['', '', '', '', '', '', ''],
				'2 colors': ['', '', '', '', '', '', ''],
				'3 colors': ['', '', '', '', '', '', ''],
				'4 colors': ['', '', '', '', '', '', ''],
				'5 colors': ['', '', '', '', '', '', ''],
				'6 colors': ['', '', '', '', '', '', ''],
				'7 colors': ['', '', '', '', '', '', ''],
				'8 colors': ['', '', '', '', '', '', ''],
				'9 colors': ['', '', '', '', '', '', ''],
				'10 colors': ['', '', '', '', '', '', ''],
				'11 colors': ['', '', '', '', '', '', ''],
				'12 colors': ['', '', '', '', '', '', ''],
				perScreenNew: '',
				perScreenExisting: '',
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
				names: ['', '', '', '', '', '', ''],
				numbers: ['', '', '', '', '', '', ''],
			},
			embroidery: {
				stitchCount: '',
				costPerThousandStitches: '',
				hoopingFee: '',
				costPerFirst5000Stitches: '',
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
