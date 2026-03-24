import { getMonthlySummary } from './summary.service.js'

export async function getSummary(req, res) {
  const userId = req.user.id
  const year = req.query.year ? parseInt(req.query.year, 10) : undefined
  const month = req.query.month ? parseInt(req.query.month, 10) : undefined
  const limit = req.query.limit ? parseInt(req.query.limit, 10) : 12

  const options = { limit }
  if (year && !Number.isNaN(year)) options.year = year
  if (month && !Number.isNaN(month) && month >= 1 && month <= 12) options.month = month

  const summary = await getMonthlySummary(userId, options)
  res.json({ ok: true, data: summary })
}
