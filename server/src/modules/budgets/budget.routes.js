import { Router } from 'express'
import {
  deleteBudget,
  getBudgets,
  patchBudget,
  postBudget,
} from './budget.controller.js'
import { protectRoute } from '../../middlewares/protectRoute.js'

export const budgetsRouter = Router()

budgetsRouter.use(protectRoute)
budgetsRouter.get('/', getBudgets)
budgetsRouter.post('/', postBudget)
budgetsRouter.patch('/:id', patchBudget)
budgetsRouter.delete('/:id', deleteBudget)
