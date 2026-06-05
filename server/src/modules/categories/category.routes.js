import { Router } from 'express'
import {
  deleteCategory,
  getCategories,
  patchCategory,
  postCategory,
} from './category.controller.js'
import { protectRoute } from '../../middlewares/protectRoute.js'

export const categoriesRouter = Router()

categoriesRouter.use(protectRoute)
categoriesRouter.get('/', getCategories)
categoriesRouter.post('/', postCategory)
categoriesRouter.patch('/:id', patchCategory)
categoriesRouter.delete('/:id', deleteCategory)
