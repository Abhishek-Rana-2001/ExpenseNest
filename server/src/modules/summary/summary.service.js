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

/**
 * Aggregate transactions by category for a given period (defaults to expenses).
 * Used by the dashboard / analytics for pie charts, top-spending lists, etc.
 *
 * @param {string} userId
 * @param {object} options
 * @param {number} [options.year]
 * @param {number} [options.month]  - 1-12, requires year
 * @param {'expense'|'income'} [options.type] - defaults to 'expense'
 * @returns {Promise<Array<{
 *   categoryId: import('mongoose').Types.ObjectId | null,
 *   name: string,
 *   color: string | null,
 *   icon: string | null,
 *   total: number,
 *   transactionCount: number
 * }>>}
 */
export async function getCategoryBreakdown(userId, options = {}) {
  const { year, month, type = 'expense' } = options

  const matchStage = {
    userId: new mongoose.Types.ObjectId(userId),
    type,
  }

  if (year) {
    matchStage.$expr = month
      ? {
          $and: [
            { $eq: [{ $year: '$date' }, year] },
            { $eq: [{ $month: '$date' }, month] },
          ],
        }
      : { $eq: [{ $year: '$date' }, year] }
  }

  const pipeline = [
    { $match: matchStage },
    {
      $group: {
        _id: '$categoryId',
        total: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: 0,
        categoryId: '$_id',
        name: { $ifNull: ['$category.name', 'Uncategorized'] },
        color: { $ifNull: ['$category.color', null] },
        icon: { $ifNull: ['$category.icon', null] },
        total: 1,
        transactionCount: 1,
      },
    },
    { $sort: { total: -1 } },
  ]

  return Transaction.aggregate(pipeline)
}
