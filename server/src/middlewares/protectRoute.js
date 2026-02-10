import jwt from 'jsonwebtoken'

import { getEnv } from '../config/env.js'
import { AppError } from '../lib/AppError.js'

const { JWT_ACCESS_SECRET } = getEnv()

export const protectRoute = (req, _res, next) => {
  const auth = req.headers.authorization
  const token = auth?.startsWith('Bearer ') ? auth.split(' ')[1] : null

  if (!token) {
    throw new AppError('Unauthorized', { status: 401, code: 'UNAUTHORIZED' })
  }

  try {
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET)
    if (decoded?.type !== 'access') {
      throw new Error('Invalid token type')
    }
    req.user = { id: decoded.sub }
    return next()
  } catch {
    throw new AppError('Unauthorized', { status: 401, code: 'UNAUTHORIZED' })
  }
}
