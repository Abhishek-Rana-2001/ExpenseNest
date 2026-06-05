import mongoose from 'mongoose'

const BudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      required: true,
      enum: ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'],
    },
  },
  {
    timestamps: true,
  },
)

// One budget per (user, category). Auto-repeats every month — the period is
// derived at read time.
BudgetSchema.index({ userId: 1, categoryId: 1 }, { unique: true })

export const Budget =
  mongoose.models.Budget ?? mongoose.model('Budget', BudgetSchema)
