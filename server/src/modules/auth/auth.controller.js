import {
  loginUser,
  refreshTokens,
  registerUser,
  revokeUserRefreshTokens,
} from './auth.service.js'
import { LoginSchema, RegisterSchema } from './auth.schema.js'

const REFRESH_COOKIE_NAME = 'refreshToken'

function setRefreshCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production'
  res.cookie(REFRESH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProd,
    path: '/api/auth',
  })
}

export async function registerController(req, res) {
  const input = RegisterSchema.parse(req.body)
  const { user, accessToken, refreshToken } = await registerUser(input)

  setRefreshCookie(res, refreshToken)

  res.status(201).json({
    ok: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    },
  })
}

export async function loginController(req, res) {
  const input = LoginSchema.parse(req.body)
  const { user, accessToken, refreshToken } = await loginUser(input)

  setRefreshCookie(res, refreshToken)

  res.json({
    ok: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    },
  })
}

export async function refreshController(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!token) {
    return res.status(401).json({
      ok: false,
      error: {
        message: 'No refresh token',
        code: 'NO_REFRESH_TOKEN',
      },
    })
  }

  const { user, accessToken, refreshToken } = await refreshTokens(token)
  setRefreshCookie(res, refreshToken)

  res.json({
    ok: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      accessToken,
    },
  })
}

export async function logoutController(req, res) {
  const token = req.cookies?.[REFRESH_COOKIE_NAME]
  if (token) {
    try {
      const payload = JSON.parse(
        Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8'),
      )
      if (payload?.sub) {
        await revokeUserRefreshTokens(payload.sub)
      }
    } catch {
      // ignore
    }
  }

  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' })
  res.status(204).end()
}

