import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Plan from '@/models/Plan';
import logger from '@/utils/logger';

interface ClientPlan {
	_id: string;
	planId: string;
	name: string;
	price: number;
	users: number;
	clients: number;
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<ClientPlan | { message: string }>
) {
	logger.info(`Request method: ${req.method}`);
	logger.info(`Query parameters: ${JSON.stringify(req.query)}`);

	if (req.method !== 'GET') {
		res.setHeader('Allow', ['GET']);
		logger.warn(`Method ${req.method} Not Allowed`);
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	const { planId } = req.query;

	if (!planId || typeof planId !== 'string') {
		logger.error(`Invalid plan ID: ${planId}`);
		return res.status(400).json({ message: 'Invalid plan ID' });
	}

	try {
		await dbConnect();
		logger.info('Connected to database');

		const plan = await Plan.findOne({ planId }).lean().exec();
		if (!plan) {
			logger.warn(`No plan found for plan ID: ${planId}`);
			return res.status(404).json({ message: 'Plan not found' });
		}

		logger.info(`Fetched plan: ${JSON.stringify(plan)}`);

		// Transform the plan data to the client-friendly format
		const transformedPlan: ClientPlan = {
			_id: plan._id.toString(),
			planId: plan.planId,
			name: plan.name,
			price: plan.price,
			users: plan.users,
			clients: plan.clients,
		};
		logger.info(`Transformed plan: ${JSON.stringify(transformedPlan)}`);

		res.status(200).json(transformedPlan);
	} catch (error) {
		if (error instanceof Error) {
			logger.error('Failed to fetch plan:', {
				message: error.message,
				stack: error.stack,
			});
			res.status(500).json({ message: 'Failed to fetch plan' });
		} else {
			logger.error('Failed to fetch plan due to an unknown error');
			res
				.status(500)
				.json({ message: 'Failed to fetch plan due to an unknown error' });
		}
	}
}
