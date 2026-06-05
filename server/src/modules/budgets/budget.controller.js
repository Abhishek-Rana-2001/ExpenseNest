import { CreateBudgetSchema, UpdateBudgetSchema } from './budget.schema.js'
import {
  createBudget,
  deleteBudget as deleteBudgetService,
  listBudgets,
  updateBudget,
} from './budget.service.js'

export async function getBudgets(req, res) {
  const data = await listBudgets(req.user.id)
  res.json({ ok: true, data })
}

export async function postBudget(req, res) {
  const input = CreateBudgetSchema.parse(req.body)
  const data = await createBudget({ userId: req.user.id, ...input })
  res.status(201).json({ ok: true, data })
}

export async function patchBudget(req, res) {
  const input = UpdateBudgetSchema.parse(req.body)
  const data = await updateBudget({
    userId: req.user.id,
    budgetId: req.params.id,
    input,
  })
  res.json({ ok: true, data })
}

export async function deleteBudget(req, res) {
  await deleteBudgetService({
    userId: req.user.id,
    budgetId: req.params.id,
  })
  res.status(204).end()
}
