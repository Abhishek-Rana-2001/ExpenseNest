/**
 * One-time migration: convert free-text category strings on Transaction and
 * Budget docs into Category documents + `categoryId` references.
 *
 * Run once after deploying the Category model change:
 *   node server/scripts/migrate-categories.js
 *
 * Safe to re-run — it's idempotent (only touches docs without categoryId).
 */
import 'dotenv/config'
import mongoose from 'mongoose'

import { getEnv } from '../src/config/env.js'
import { connectToMongo } from '../src/db/connect.js'
import { Budget } from '../src/modules/budgets/budget.model.js'
import { Category } from '../src/modules/categories/category.model.js'
import { Transaction } from '../src/modules/transactions/transactions.model.js'

async function run() {
  const env = getEnv()
  if (!env.MONGODB_URI) {
    console.error('MONGODB_URI not set — aborting')
    process.exit(1)
  }
  await connectToMongo(env.MONGODB_URI)
  console.log('Connected to MongoDB. Starting migration…')

  let categoriesCreated = 0
  let transactionsUpdated = 0
  let budgetsUpdated = 0

  // --- Transactions: backfill categoryId from existing category string ---
  const txCursor = Transaction.find({
    category: { $exists: true, $ne: null, $ne: '' },
    categoryId: { $exists: false },
  }).cursor()

  for await (const tx of txCursor) {
    const cat = await findOrCreate(tx.userId, tx.category)
    if (cat._wasCreated) categoriesCreated++
    tx.categoryId = cat._id
    tx.category = cat.name // normalize to the canonical Category name
    await tx.save()
    transactionsUpdated++
  }

  // --- Budgets: convert legacy `category` string into categoryId ---
  // Use raw collection access since the model no longer has a `category` field.
  const budgetCol = mongoose.connection.collection('budgets')
  const legacyBudgets = budgetCol.find({
    category: { $exists: true, $ne: null, $ne: '' },
    categoryId: { $exists: false },
  })

  for await (const b of legacyBudgets) {
    const cat = await findOrCreate(b.userId, b.category)
    if (cat._wasCreated) categoriesCreated++
    try {
      await budgetCol.updateOne(
        { _id: b._id },
        { $set: { categoryId: cat._id }, $unset: { category: '' } },
      )
      budgetsUpdated++
    } catch (err) {
      if (err.code === 11000) {
        // A budget for this category already exists — drop the legacy one.
        console.warn(
          `Duplicate budget for ${cat.name} (user ${b.userId}); deleting legacy doc ${b._id}`,
        )
        await budgetCol.deleteOne({ _id: b._id })
      } else {
        throw err
      }
    }
  }

  console.log(`Done.`)
  console.log(`  categoriesCreated:    ${categoriesCreated}`)
  console.log(`  transactionsUpdated:  ${transactionsUpdated}`)
  console.log(`  budgetsUpdated:       ${budgetsUpdated}`)

  await mongoose.disconnect()
}

async function findOrCreate(userId, name) {
  const trimmed = String(name).trim()
  const existing = await Category.findOneAndUpdate(
    { userId, name: trimmed },
    { $setOnInsert: { userId, name: trimmed } },
    {
      upsert: true,
      new: true,
      collation: { locale: 'en', strength: 2 },
      // Track whether we created it (rawResult lets us read the upsertedCount)
      includeResultMetadata: true,
    },
  )
  const doc = existing.value ?? existing
  doc._wasCreated = Boolean(existing.lastErrorObject?.upserted)
  return doc
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
