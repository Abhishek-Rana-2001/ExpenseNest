import argon2 from 'argon2'
import jwt from 'jsonwebtoken'

import { getEnv } from '../../config/env.js'
import { AppError } from '../../lib/AppError.js'
import { User } from '../users/user.model.js'

const { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } = getEnv()

function signAccessToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      type: 'access',
    },
    JWT_ACCESS_SECRET,
    {
      expiresIn: '15m',
    },
  )
}

function signRefreshToken(user) {
  return jwt.sign(
    {
      sub: String(user._id),
      type: 'refresh',
      tokenVersion: user.tokenVersion ?? 0,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: '7d',
    },
  )
}

export async function registerUser(input) {
  const existing = await User.findOne({ email: input.email }).lean()
  if (existing) {
    throw new AppError('Email already in use', {
      status: 409,
      code: 'EMAIL_TAKEN',
    })
  }

  const passwordHash = await argon2.hash(input.password)
  const user = await User.create({
    email: input.email,
    passwordHash,
    name: input.name,
  })

  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)

  return { user, accessToken, refreshToken }
}

export async function loginUser(input) {
  const user = await User.findOne({ email: input.email })
  if (!user || !user.passwordHash) {
    throw new AppError('Invalid credentials', {
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
  }

  const ok = await argon2.verify(user.passwordHash, input.password)
  if (!ok) {
    throw new AppError('Invalid credentials', {
      status: 401,
      code: 'INVALID_CREDENTIALS',
    })
  }

  const accessToken = signAccessToken(user)
  const refreshToken = signRefreshToken(user)

  return { user, accessToken, refreshToken }
}

export async function refreshTokens(refreshToken) {
  let payload
  try {
    payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET)
  } catch {
    throw new AppError('Invalid refresh token', {
      status: 401,
      code: 'INVALID_REFRESH_TOKEN',
    })
  }

  if (payload.type !== 'refresh') {
    throw new AppError('Invalid token type', {
      status: 401,
      code: 'INVALID_REFRESH_TOKEN',
    })
  }

  const user = await User.findById(payload.sub)
  if (!user) {
    throw new AppError('User not found', {
      status: 401,
      code: 'INVALID_REFRESH_TOKEN',
    })
  }

  if ((user.tokenVersion ?? 0) !== (payload.tokenVersion ?? 0)) {
    throw new AppError('Refresh token revoked', {
      status: 401,
      code: 'INVALID_REFRESH_TOKEN',
    })
  }

  const accessToken = signAccessToken(user)
  const newRefreshToken = signRefreshToken(user)

  return { user, accessToken, refreshToken: newRefreshToken }
}

export async function revokeUserRefreshTokens(userId) {
  await User.findByIdAndUpdate(userId, { $inc: { tokenVersion: 1 } })
}

