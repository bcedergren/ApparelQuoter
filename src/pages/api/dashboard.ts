import type { NextApiRequest, NextApiResponse } from 'next'
import mongoose from 'mongoose'
import dbConnect from '@/utils/dbConnect'
import Payment from '@/models/Payment'
import Customer from '@/models/Customer'
import Activity from '@/models/Activity'
import Sale from '@/models/Sale'
import Quote from '@/models/Quote'
import { requireAuth } from '@/lib/auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).end(`Method ${req.method} Not Allowed`)
  }

  try {
    await dbConnect()

    // Require authentication and use session's companyId
    const session = await requireAuth(req, res)
    if (!session) return

    // Use the authenticated user's companyId instead of trusting query parameter
    const companyId = session.user.companyId

    if (!companyId) {
      return res.status(400).json({ message: 'User company not found' })
    }

    const companyObjectId = new mongoose.Types.ObjectId(companyId as string)

    // Fetch total number of customers and customers created in the last week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const totalCustomersCount = await Customer.countDocuments({
      companyId: companyObjectId,
    })

    const newCustomersCount = await Customer.countDocuments({
      companyId: companyObjectId,
      createdAt: { $gte: oneWeekAgo },
    })

    // Fetch total sales count and sales from the last 7 days
    const totalSalesCount = await Sale.countDocuments({
      companyId: companyObjectId,
    })

    const newSalesCount = await Sale.countDocuments({
      companyId: companyObjectId,
      saleDate: { $gte: oneWeekAgo },
    })

    // Fetch total income and income from the current week
    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())

    const totalIncomeResult = await Sale.aggregate([
      { $match: { companyId: companyObjectId } },
      { $group: { _id: null, totalIncome: { $sum: '$totalAmount' } } },
    ])

    const totalIncome = totalIncomeResult[0]?.totalIncome || 0

    const weeklyIncomeResult = await Sale.aggregate([
      {
        $match: {
          companyId: companyObjectId,
          saleDate: { $gte: startOfWeek },
        },
      },
      { $group: { _id: null, weeklyIncome: { $sum: '$totalAmount' } } },
    ])

    const weeklyIncome = weeklyIncomeResult[0]?.weeklyIncome || 0

    // Fetch recent activities from the Activity collection
    const recentActivities = await Activity.find({ companyId: companyObjectId })
      .sort({ timestamp: -1 })
      .limit(10)

    // Fetch total orders (open orders)
    const totalOrdersCount = await Quote.countDocuments({
      companyId: companyObjectId,
      quoteType: 'openOrders',
    })

    const newOrdersCount = await Quote.countDocuments({
      companyId: companyObjectId,
      quoteType: 'openOrders',
      CreatedAt: { $gte: oneWeekAgo },
    })

    // Fetch recent transactions (payments)
    const transactions = await Payment.find({
      customerId: {
        $in: await Customer.find({ companyId: companyObjectId }).distinct(
          '_id'
        ),
      },
    })
      .sort({ date: -1 })
      .limit(10)
      .populate('customerId', 'name')

    // Fetch balance (sum of payments)
    const balanceResult = await Payment.aggregate([
      {
        $match: {
          customerId: {
            $in: await Customer.find({ companyId: companyObjectId }).distinct(
              '_id'
            ),
          },
        },
      },
      { $group: { _id: null, totalBalance: { $sum: '$amount' } } },
    ])
    const balance = balanceResult[0]?.totalBalance || 0

    // Fetch revenue data (monthly sales for last 12 months)
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const revenueDataRaw = await Sale.aggregate([
      {
        $match: {
          companyId: companyObjectId,
          saleDate: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$saleDate' } },
          total: { $sum: '$totalAmount' },
        },
      },
      { $sort: { _id: 1 } },
    ])

    const revenueLabels = revenueDataRaw.map((item) => item._id)
    const revenueValues = revenueDataRaw.map((item) => item.total)

    // For salesByCategory, group by quoteType
    const salesByCategoryData = await Quote.aggregate([
      { $match: { companyId: companyObjectId } },
      {
        $group: {
          _id: '$quoteType',
          count: { $sum: 1 },
        },
      },
    ])

    const salesByCategoryLabels = salesByCategoryData.map((item) => item._id)
    const salesByCategoryValues = salesByCategoryData.map((item) => item.count)

    // Fetch recent orders
    const orders = await Quote.find({
      companyId: companyObjectId,
      quoteType: 'openOrders',
    })
      .sort({ CreatedAt: -1 })
      .limit(5)
      .select('customerName summary.totalCost CreatedAt')

    // Fetch recent quotes for chart
    const recentQuotes = await Quote.find({ companyId: companyObjectId })
      .sort({ CreatedAt: -1 })
      .limit(20)

    // Fetch top products (simplified, count items)
    const productsRaw = await Quote.aggregate([
      { $match: { companyId: companyObjectId } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.brandAndStyle',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ])

    res.status(200).json({
      totalCustomers: totalCustomersCount,
      newCustomers: newCustomersCount,
      totalSales: totalSalesCount,
      newSales: newSalesCount,
      totalIncome,
      weeklyIncome,
      recentActivities,
      totalOrders: totalOrdersCount,
      newOrders: newOrdersCount,
      transactions: transactions.map((t) => ({
        type: 'credit', // assuming all are credits
        description: `Payment from ${t.customerId?.name || 'Unknown'}`,
        amount: `$${t.amount}`,
      })),
      balance: `$${balance.toFixed(2)}`,
      revenueData: {
        labels: revenueLabels,
        datasets: [
          {
            label: 'Revenue',
            data: revenueValues,
            borderColor: '#4caf50',
            fill: false,
          },
        ],
      },
      salesByCategory: {
        labels: salesByCategoryLabels,
        datasets: [
          {
            data: salesByCategoryValues,
            backgroundColor: [
              '#ff6384',
              '#36a2eb',
              '#cc65fe',
              '#ffce56',
              '#009688',
            ],
          },
        ],
      },
      orders: orders.map((o) => ({
        customerName: o.customerName,
        product: 'Quote',
        amount: `$${o.summary.totalCost}`,
      })),
      products: productsRaw.map((p) => ({
        name: p._id,
        price: `${p.count} sold`,
      })),
      recentQuotes,
    })
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    res.status(500).json({ message: 'Failed to fetch dashboard data' })
  }
}
