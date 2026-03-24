import { AppError } from '../../lib/AppError.js'
import { Transaction } from "./transactions.model.js"

/**
 * @param {string} userId
 * @param {object} [query] - Parsed list query (type, category, dateFrom, dateTo, sort, order, page, limit)
 */
export async function listTransactions(userId, query = {}) {
  const {
    type,
    category,
    dateFrom,
    dateTo,
    sort: sortField = 'date',
    order = 'desc',
    page = 1,
    limit = 20,
  } = query

  const filter = { userId }

  if (type) filter.type = type
  if (category) filter.category = category
  if (dateFrom || dateTo) {
    filter.date = {}
    if (dateFrom) filter.date.$gte = new Date(dateFrom)
    if (dateTo) filter.date.$lte = new Date(dateTo)
  }

  const sort = { [sortField]: order === 'asc' ? 1 : -1 }
  const skip = (page - 1) * limit

  const [transactions, total] = await Promise.all([
    Transaction.find(filter).sort(sort).skip(skip).limit(limit).lean(),
    Transaction.countDocuments(filter),
  ])

  return {
    data: transactions,
    total,
    page,
    limit,
  }
}

export async function createTransaction(_input) {
  const newTransaction = await Transaction.create(_input)
  return newTransaction.toObject()
}

export async function updateTransaction({ userId, transactionId, input }) {
  const updatedTransaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    input,
    { new: true, runValidators: true },
  )

  if (!updatedTransaction) {
    throw new AppError('Transaction not found', {
      status: 404,
      code: 'TRANSACTION_NOT_FOUND',
    })
  }

  return updatedTransaction.toObject()
}
