import { AppError } from '../../lib/AppError.js'
import { findOrCreateCategory } from '../categories/category.service.js'
import { Transaction } from "./transactions.model.js"

/**
 * If `input.category` is a name string, resolve it to a Category (find or
 * create) and populate `categoryId`. Both fields are persisted: categoryId is
 * the join key, category (string) is the denormalized snapshot for fast reads.
 */
async function resolveCategory(userId, input) {
  if (!input.category) return input
  const cat = await findOrCreateCategory(userId, input.category)
  return { ...input, categoryId: cat._id, category: cat.name }
}

/**
 * @param {string} userId
 * @param {object} [query] - Parsed list query (type, category, from, to, sort, order, page, limit)
 */
export async function listTransactions(userId, query = {}) {
  const {
    type,
    search,
    category,
    from,
    to,
    sort: sortField = 'date',
    order = 'desc',
    page = 1,
    limit = 20,
  } = query

  const filter = { userId }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
    ]
  }

  if (type) filter.type = type
  if (category) filter.category = category
  if (from || to) {
    filter.date = {}
    if (from) filter.date.$gte = new Date(from)
    if (to) filter.date.$lte = new Date(to)
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
  const input = await resolveCategory(_input.userId, _input)
  const newTransaction = await Transaction.create(input)
  return newTransaction.toObject()
}

export async function updateTransaction({ userId, transactionId, input }) {
  const resolved = await resolveCategory(userId, input)
  const updatedTransaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, userId },
    resolved,
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


export async function deleteTransaction({ userId, transactionId }) {
  const deletedTransaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    userId,
  })

  if (!deletedTransaction) {
    throw new AppError('Transaction not found', {
      status: 404,
      code: 'TRANSACTION_NOT_FOUND',
    })
  }

  return deletedTransaction.toObject()
}
