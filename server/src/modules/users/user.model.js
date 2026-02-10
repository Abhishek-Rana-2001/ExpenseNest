import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    name: {
      type: String,
      trim: true,
    },
    picture: {
      type: String,
      trim: true,
    },
    passwordHash: {
      type: String,
    },
    googleSub: {
      type: String,
      unique: true,
      sparse: true,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
)

UserSchema.index({ email: 1 }, { unique: true })
UserSchema.index({ googleSub: 1 }, { unique: true, sparse: true })

export const User =
  mongoose.models.User ?? mongoose.model('User', UserSchema)

