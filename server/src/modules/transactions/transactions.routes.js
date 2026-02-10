import { Router } from 'express'

import { protectRoute } from '../../middlewares/protectRoute.js'
import {
  getTransactions,
  postTransaction,
} from './transactions.controller.js'

export const transactionsRouter = Router()

transactionsRouter.use(protectRoute)
transactionsRouter.get('/', getTransactions)
transactionsRouter.post('/', postTransaction)

