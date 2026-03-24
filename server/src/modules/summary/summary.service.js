import mongoose from 'mongoose'
import { Transaction } from '../transactions/transactions.model.js'

/**
 * Aggregates transactions by month for the dashboard.
 * @param {string} userId - User ID
 * @param {object} options - Optional filters
 * @param {number} options.year - Filter by year (e.g. 2025)
 * @param {number} options.month - Filter by month 1-12 (use with year)
 * @param {number} options.limit - Max months to return (default 12)
 * @returns {Promise<Array>} Monthly summary: income, expense, balance per month
 */
export async function getMonthlySummary(userId, options = {}) {
  const { year, month, limit = 12 } = options

  const pipeline = [
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    ...(year
      ? [
          {
            $match: month
              ? {
                  $expr: {
                    $and: [
                      { $eq: [{ $year: '$date' }, year] },
                      { $eq: [{ $month: '$date' }, month] },
                    ],
                  },
                }
              : { $expr: { $eq: [{ $year: '$date' }, year] } },
          },
        ]
      : []),
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
        },
        income: {
          $sum: { $cond: [{ $eq: ['$type', 'income'] }, '$amount', 0] },
        },
        expense: {
          $sum: { $cond: [{ $eq: ['$type', 'expense'] }, '$amount', 0] },
        },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $addFields: {
        balance: { $subtract: ['$income', '$expense'] },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: limit },
    {
      $project: {
        year: '$_id.year',
        month: '$_id.month',
        income: 1,
        expense: 1,
        balance: 1,
        transactionCount: 1,
        _id: 0,
      },
    },
  ]

  const results = await Transaction.aggregate(pipeline)
  return results
}
