import {
  CreateTransactionSchema,
  ListTransactionsQuerySchema,
  UpdateTransactionSchema,
} from './transactions.schema.js'
import {
  createTransaction,
  listTransactions,
  updateTransaction,
} from './transactions.service.js'

export async function getTransactions(req, res) {
  const query = ListTransactionsQuerySchema.parse(req.query)
  const result = await listTransactions(req.user.id, query)
  res.json({ ok: true, ...result })
}

export async function postTransaction(req, res) {
  const input = CreateTransactionSchema.parse(req.body)
  const data = await createTransaction({userId:req.user.id, ...input})
  res.status(201).json({ ok: true, data })
}

export async function patchTransaction(req, res) {
  const input = UpdateTransactionSchema.parse(req.body)
  const data = await updateTransaction({
    userId: req.user.id,
    transactionId: req.params.id,
    input,
  })
  res.json({ ok: true, data })
}

