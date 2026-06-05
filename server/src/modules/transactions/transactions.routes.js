import { Router } from 'express'
import {
  deleteTransaction,
  getTransactions,
  patchTransaction,
  postTransaction,
} from './transactions.controller.js'
import { protectRoute } from '../../middlewares/protectRoute.js'

export const transactionsRouter = Router()

transactionsRouter.use(protectRoute)
transactionsRouter.get('/', getTransactions)
transactionsRouter.post('/', postTransaction)
transactionsRouter.patch('/:id', patchTransaction)
transactionsRouter.delete('/:id', deleteTransaction)


