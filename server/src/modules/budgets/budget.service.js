import { AppError } from '../../lib/AppError.js'
import { findOrCreateCategory } from '../categories/category.service.js'
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
