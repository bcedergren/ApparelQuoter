import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/utils/dbConnect';
import Payment from '@/models/Payment';
import Customer from '@/models/Customer';
import Quote, { IQuote } from '@/models/Quote';
import Activity from '@/models/Activity'; // Import the Activity model

// Utility function to determine if a quote is an order
function isOrder(quote: IQuote): boolean {
	const orderTypes: IQuote['quoteType'][] = [
		'openOrders',
		'savedOrders',
		'completedOrders',
	];
	return orderTypes.includes(quote.quoteType);
}

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse
) {
	if (req.method !== 'GET') {
		return res.status(405).end(`Method ${req.method} Not Allowed`);
	}

	try {
		await dbConnect();

		// Extract companyId from the query parameters
		const { companyId } = req.query;

		if (!companyId) {
			return res.status(400).json({ message: 'Company ID is required' });
		}

		// Fetch customers for the logged-in company
		const customers = await Customer.find({ companyId });

		let newCustomersCount = 0;
		let newOrdersCount = 0;
		let newSalesCount = 0;

		// Loop through each customer to determine new statuses
		for (const customer of customers) {
			const customerQuotes = await Quote.find({
				selectedCustomerId: customer._id,
				companyId,
			});

			// Check if the customer is new
			if (customerQuotes.length === 0) {
				newCustomersCount++;
			} else {
				// Identify if there is a new order
				const customerOrders = customerQuotes.filter(isOrder);
				if (customerOrders.length === 1) {
					newOrdersCount++;
				}

				// Identify if there is a new sale (first order paid/deposited)
				const firstOrder = customerOrders[0];
				if (firstOrder && firstOrder.summary.depositPercentage > 0) {
					newSalesCount++;
				}
			}
		}

		// Fetch total number of orders for the company
		const totalOrders = await Quote.countDocuments({ companyId });

		// Fetch total sales (sum of all orders' total prices)
		const totalSales = await Quote.aggregate([
			{
				$match: {
					companyId,
					quoteType: { $in: ['openOrders', 'savedOrders', 'completedOrders'] },
				},
			},
			{ $group: { _id: null, totalSales: { $sum: '$summary.totalPrice' } } },
		]);

		// Fetch total payments
		const totalPayments = await Payment.aggregate([
			{ $match: { companyId } },
			{ $group: { _id: null, totalPayments: { $sum: '$amount' } } },
		]);

		// Fetch recent activities from the Activity collection
		const recentActivities = await Activity.find({ companyId })
			.sort({ timestamp: -1 }) // Sort by timestamp in descending order
			.limit(10);

		res.status(200).json({
			totalCustomers: customers.length,
			totalOrders,
			totalSales: totalSales[0]?.totalSales || 0,
			totalPayments: totalPayments[0]?.totalPayments || 0,
			newCustomers: newCustomersCount,
			newOrders: newOrdersCount,
			newSales: newSalesCount,
			recentActivities, // Send the fetched recent activities
		});
	} catch (error) {
		console.error('Error fetching dashboard data:', error);
		res.status(500).json({ message: 'Failed to fetch dashboard data' });
	}
}
