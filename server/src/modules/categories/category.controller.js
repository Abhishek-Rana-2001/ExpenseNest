import {
  CreateCategorySchema,
  UpdateCategorySchema,
} from './category.schema.js'
import {
  createCategory,
  deleteCategory as deleteCategoryService,
  listCategories,
  updateCategory,
} from './category.service.js'

export async function getCategories(req, res) {
  const data = await listCategories(req.user.id)
  res.json({ ok: true, data })
}

export async function postCategory(req, res) {
  const input = CreateCategorySchema.parse(req.body)
  const data = await createCategory({ userId: req.user.id, ...input })
  res.status(201).json({ ok: true, data })
}

export async function patchCategory(req, res) {
  const input = UpdateCategorySchema.parse(req.body)
  const data = await updateCategory({
    userId: req.user.id,
    categoryId: req.params.id,
    input,
  })
  res.json({ ok: true, data })
}

export async function deleteCategory(req, res) {
  await deleteCategoryService({
    userId: req.user.id,
    categoryId: req.params.id,
  })
  res.status(204).end()
}
