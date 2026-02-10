import { CreateTransactionSchema } from './transactions.schema.js'
import { createTransaction, listTransactions } from './transactions.service.js'

export async function getTransactions(_req, res) {
  const data = await listTransactions()
  res.json({ ok: true, data })
}

export async function postTransaction(req, res) {
  const input = CreateTransactionSchema.parse(req.body)
  const data = await createTransaction(input)
  res.status(201).json({ ok: true, data })
}

