import { Router } from 'express'

import {
  loginController,
  logoutController,
  refreshController,
  registerController,
} from './auth.controller.js'
import { loginLimiter } from '../../middlewares/rateLimiter.js'

export const authRouter = Router()

authRouter.post('/register', registerController)
authRouter.post('/login',loginLimiter, loginController)
authRouter.post('/refresh', refreshController)
authRouter.post('/logout', logoutController)

