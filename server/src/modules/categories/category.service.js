import { AppError } from '../../lib/AppError.js'
import { Budget } from '../budgets/budget.model.js'
import { Transaction } from '../transactions/transactions.model.js'
import { Category } from './category.model.js'

export async function listCategories(userId) {
  return Category.find({ userId }).sort({ name: 1 }).lean()
}

/**
 * Atomic find-or-create. Used by transaction and budget creation so users can
 * type a new category name and the backend ensures a Category document exists
 * without any race conditions.
 */
export async function findOrCreateCategory(userId, name) {
  const trimmed = name?.trim()
  if (!trimmed) {
    throw new AppError('Category name is required', {
      status: 400,
      code: 'CATEGORY_NAME_REQUIRED',
    })
  }
  const doc = await Category.findOneAndUpdate(
    { userId, name: trimmed },
    { $setOnInsert: { userId, name: trimmed } },
    {
      upsert: true,
      new: true,
      collation: { locale: 'en', strength: 2 },
    },
  )
  return doc
}

export async function createCategory({ userId, ...input }) {
  try {
    const doc = await Category.create({ userId, ...input })
    return doc.toObject()
  } catch (err) {
    if (err.code === 11000) {
      throw new AppError('Category already exists', {
        status: 409,
        code: 'CATEGORY_EXISTS',
      })
    }
    throw err
  }
}

export async function updateCategory({ userId, categoryId, input }) {
  const updated = await Category.findOneAndUpdate(
    { _id: categoryId, userId },
    input,
    { new: true, runValidators: true },
  )
  if (!updated) {
    throw new AppError('Category not found', {
      status: 404,
      code: 'CATEGORY_NOT_FOUND',
    })
  }
  return updated.toObject()
}

/**
 * Deleting a category orphans its transactions and budgets. Transactions keep
 * their `category` string snapshot so history doesn't break; new budgets are
 * removed because they're useless without a category ref.
 */
export async function deleteCategory({ userId, categoryId }) {
  const deleted = await Category.findOneAndDelete({ _id: categoryId, userId })
  if (!deleted) {
    throw new AppError('Category not found', {
      status: 404,
      code: 'CATEGORY_NOT_FOUND',
    })
  }
  await Promise.all([
    Transaction.updateMany(
      { userId, categoryId },
      { $unset: { categoryId: '' } },
    ),
    Budget.deleteMany({ userId, categoryId }),
  ])
  return deleted.toObject()
}
