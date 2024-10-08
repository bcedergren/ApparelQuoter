import type { NextApiRequest, NextApiResponse } from 'next';
import mongoose from 'mongoose';
import dbConnect from '@/utils/dbConnect';
import Payment from '@/models/Payment';
import Customer from '@/models/Customer';
import Activity from '@/models/Activity';
import Sale from '@/models/Sale';

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	try {
		await dbConnect();

		const { companyId } = req.query;

		if (!companyId) {
			return res.status(400).json({ message: 'Company ID is required' });
		}

		const companyObjectId = new mongoose.Types.ObjectId(companyId as string);

		// Fetch total number of customers and customers created in the last week
		const oneWeekAgo = new Date();
		oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

		const totalCustomersCount = await Customer.countDocuments({
			companyId: companyObjectId,
		});

		const newCustomersCount = await Customer.countDocuments({
			companyId: companyObjectId,
			createdAt: { $gte: oneWeekAgo },
		});

		// Fetch total sales count and sales from the last 7 days
		const totalSalesCount = await Sale.countDocuments({
			companyId: companyObjectId,
		});

		const newSalesCount = await Sale.countDocuments({
			companyId: companyObjectId,
			saleDate: { $gte: oneWeekAgo },
		});

		// Fetch total income and income from the current week
		const startOfWeek = new Date();
		startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

		const totalIncomeResult = await Sale.aggregate([
			{ $match: { companyId: companyObjectId } },
			{ $group: { _id: null, totalIncome: { $sum: '$totalAmount' } } },
		]);

		const totalIncome = totalIncomeResult[0]?.totalIncome || 0;

		const weeklyIncomeResult = await Sale.aggregate([
			{
				$match: {
					companyId: companyObjectId,
					saleDate: { $gte: startOfWeek },
				},
			},
			{ $group: { _id: null, weeklyIncome: { $sum: '$totalAmount' } } },
		]);

		const weeklyIncome = weeklyIncomeResult[0]?.weeklyIncome || 0;

		// Fetch recent activities from the Activity collection
		const recentActivities = await Activity.find({ companyId: companyObjectId })
			.sort({ timestamp: -1 })
			.limit(10);

		res.status(200).json({
			totalCustomers: totalCustomersCount,
			newCustomers: newCustomersCount,
			totalSales: totalSalesCount,
			newSales: newSalesCount,
			totalIncome,
			weeklyIncome,
			recentActivities,
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		res.status(500).json({ message: 'Failed to fetch dashboard data' });
	}
}
