import type { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import logger from '@/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: '2023-10-16',
});

type SubscriptionResponse =
	| {
			plan: {
				id: string;
			};
	  }
	| { message: string };

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<SubscriptionResponse>
) {
	logger.info(`Request method: ${req.method}`);
	logger.info(`Query parameters: ${JSON.stringify(req.query)}`);

	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		logger.warn(`Method ${req.method} Not Allowed`);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { subscriptionId } = req.query;

	if (typeof subscriptionId !== 'string') {
		logger.error('Invalid subscription ID');
		return res.status(400).json({ message: 'Invalid subscription ID' });
	}

	try {
		logger.info(`Fetching subscription with ID: ${subscriptionId}`);
		const subscription = await stripe.subscriptions.retrieve(subscriptionId);
		logger.info('Fetched subscription');

		const planId = subscription.items.data[0]?.plan.id;
		if (!planId) {
			const errorMsg = 'Plan ID not found in subscription';
			logger.error(errorMsg);
			return res.status(404).json({ message: errorMsg });
		}

		logger.info(`Fetched plan ID from subscription: ${planId}`);

		res.status(200).json({ plan: { id: planId } });
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to fetch subscription:', {
				message: error.message,
				stack: error.stack,
			});
			res.status(500).json({ message: 'Failed to fetch subscription' });
		} else {
			logger.error('Failed to fetch subscription due to an unknown error');
			res.status(500).json({
				message: 'Failed to fetch subscription due to an unknown error',
			});
		}
	}
}
