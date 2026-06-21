import mongoose from 'mongoose'

const AttachmentSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },           // R2 object key, e.g. attachments/<userId>/<uuid>-receipt.jpg
    contentType: { type: String, required: true },   // 'image/jpeg' | 'image/png' | 'application/pdf'
    size: { type: Number, required: true },          // bytes
    filename: { type: String, required: true },      // original filename, for download UX
    width: { type: Number },                         // optional, set by sharp at upload time
    height: { type: Number },                        // optional, same
    uploadedAt: { type: Date, default: Date.now },
  },
  {
    _id:false
  }
)


const TransactionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    currency: { type: String, required: true, default: 'INR' },
    type: { type: String, required: true, enum: ['income', 'expense'] },
    description: { type: String },
    date: { type: Date, default: Date.now },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      index: true,
    },
    category: { type: String }, // denormalized snapshot for fast reads / legacy data
    paymentMethod: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank'],
      default: 'cash',
    },
    isRecurring: { type: Boolean, default: false },
    attachments: {type:[AttachmentSchema], default:[]}
  },
  {
    timestamps: true,
  },
)

export const Transaction =
  mongoose.models.Transaction ?? mongoose.model('Transaction', TransactionSchema)

