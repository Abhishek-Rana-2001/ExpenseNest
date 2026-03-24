import { Router } from 'express'

import { protectRoute } from '../../middlewares/protectRoute.js'
import {
  getTransactions,
  patchTransaction,
  postTransaction,
} from './transactions.controller.js'

export const transactionsRouter = Router()

transactionsRouter.use(protectRoute)
transactionsRouter.get('/', getTransactions)
transactionsRouter.post('/', postTransaction)
transactionsRouter.patch('/:id', patchTransaction)

