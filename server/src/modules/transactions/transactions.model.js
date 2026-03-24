import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    description: { type: String },
    date: { type: Date, default: Date.now },
    category: { type: String },
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank'],
      default: 'cash',
    },
    isRecurring: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
)

export const Transaction =
  mongoose.models.Transaction ?? mongoose.model('Transaction', TransactionSchema)

