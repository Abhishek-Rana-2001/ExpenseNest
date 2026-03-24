import { Router } from 'express'

import { protectRoute } from '../../middlewares/protectRoute.js'
import { getSummary } from './summary.controller.js'

export const summaryRouter = Router()

summaryRouter.use(protectRoute)
summaryRouter.get('/', getSummary)
