import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'USD' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    description: { type: String },
    date: { type: Date, default: Date.now },
    category: { type: String },
  },
  {
    timestamps: true,
  },
)

export const Transaction =
  mongoose.models.Transaction ?? mongoose.model('Transaction', TransactionSchema)

