import { AppError } from '../../lib/AppError.js'
import { findOrCreateCategory } from '../categories/category.service.js'
import { Transaction } from '../transactions/transactions.model.js'
import { Budget } from './budget.model.js'

async function resolveCategory(userId, input) {
  if (!input.category) return input
  const cat = await findOrCreateCategory(userId, input.category)
  const { category, ...rest } = input
  return { ...rest, categoryId: cat._id }
}

export async function listBudgets(userId) {
  return Budget.find({ userId })
    .populate('categoryId', 'name color icon')
    .sort({ createdAt: -1 })
    .lean()
}

export async function createBudget({ userId, ...input }) {
  const resolved = await resolveCategory(userId, input)
  try {
    const newBudget = await Budget.create({ userId, ...resolved })
    await newBudget.populate('categoryId', 'name color icon')
    return newBudget.toObject()
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Budget already exists for this category', {
        status: 409,
        code: 'BUDGET_EXISTS',
      })
    }
    throw err
  }
}

export async function updateBudget({ userId, budgetId, input }) {
  const resolved = await resolveCategory(userId, input)
  const updated = await Budget.findOneAndUpdate(
    { _id: budgetId, userId },
    resolved,
    { new: true, runValidators: true },
  ).populate('categoryId', 'name color icon')
  if (!updated) {
    throw new AppError('Budget not found', {
      status: 404,
      code: 'BUDGET_NOT_FOUND',
    })
  }
  return updated.toObject()
}

export async function deleteBudget({ userId, budgetId }) {
  const deleted = await Budget.findOneAndDelete({ _id: budgetId, userId })
  if (!deleted) {
    throw new AppError('Budget not found', {
      status: 404,
      code: 'BUDGET_NOT_FOUND',
    })
  }
  return deleted.toObject()
}


/**
 * Get a budget + the transactions that contribute to it for a given month,
 * with computed spent / remaining / percent.
 *
 * Defaults to the current calendar month. Pass { year, month: 1-12 } to override.
 */
export async function getBudgetService({ userId, budgetId, year, month }) {
  const budget = await Budget.findOne({ _id: budgetId, userId })
    .populate('categoryId', 'name color icon')
    .lean()

  if (!budget) {
    throw new AppError('Budget not found', {
      status: 404,
      code: 'BUDGET_NOT_FOUND',
    })
  }

  // Determine the period window.
  const now = new Date()
  const y = year ?? now.getFullYear()
  const m = month ?? now.getMonth() + 1 // JS months 0-11 → human 1-12
  const periodStart = new Date(y, m - 1, 1, 0, 0, 0, 0)
  const periodEnd = new Date(y, m, 1, 0, 0, 0, 0) // start of next month (exclusive)

  // Pull all expense transactions in this category for the period.
  // The populated categoryId is an object; use its _id for the query.
  const categoryId =
    typeof budget.categoryId === 'object' && budget.categoryId
      ? budget.categoryId._id
      : budget.categoryId

  const transactions = await Transaction.find({
    userId,
    categoryId,
    type: 'expense',
    date: { $gte: periodStart, $lt: periodEnd },
  })
    .sort({ date: -1 })
    .lean()

  const spent = transactions.reduce((acc, t) => acc + t.amount, 0)
  const remaining = budget.amount - spent
  const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0

  return {
    ...budget,
    period: { year: y, month: m, start: periodStart, end: periodEnd },
    spent,
    remaining,
    percent,
    transactions,
    transactionCount: transactions.length,
  }
}
