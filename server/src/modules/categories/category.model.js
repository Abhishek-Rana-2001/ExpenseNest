import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    color: {
      type: String, // hex like '#f59e0b'
      default: null,
    },
    icon: {
      type: String, // lucide icon name like 'Utensils'
      default: null,
    },
  },
  {
    timestamps: true,
    collation: { locale: 'en', strength: 2 },
  },
)

// One category per (user, name). Collation: 2 = case-insensitive, accent-insensitive.
CategorySchema.index(
  { userId: 1, name: 1 },
  { unique: true, collation: { locale: 'en', strength: 2 } },
)

export const Category =
  mongoose.models.Category ?? mongoose.model('Category', CategorySchema)
