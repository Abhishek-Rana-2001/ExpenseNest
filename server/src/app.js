import cors from 'cors'
import cookieParser from 'cookie-parser'
import express from 'express'

import { errorHandler } from './middlewares/error.js'
import { notFound } from './middlewares/notFound.js'
import { authRouter } from './modules/auth/auth.routes.js'
import { healthRouter } from './modules/health/health.routes.js'
import { transactionsRouter } from './modules/transactions/transactions.routes.js'

export function createApp() {
  const app = express()

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  )
  app.use(express.json())
  app.use(cookieParser())

  app.get('/', (_req, res) => {
    res.type('text/plain').send('OK')
  })

  app.use('/api/auth', authRouter)
  app.use('/api', healthRouter)
  app.use('/api/transactions', transactionsRouter)

  app.use(notFound)
  app.use(errorHandler)

  return app
}

