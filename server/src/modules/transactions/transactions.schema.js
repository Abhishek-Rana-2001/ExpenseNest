import { z } from 'zod'

/** Query params for GET /transactions – filter, sort, paginate */
export const ListTransactionsQuerySchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  category: z.string().min(1).optional(),
  dateFrom: z.iso.datetime().optional(),
  dateTo: z.iso.datetime().optional(),
  sort: z.enum(['date', 'amount', 'createdAt']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const CreateTransactionSchema = z.object({
  amount: z.number(),
  currency: z.string().min(1).default('USD'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1).optional(),
  date: z.iso.datetime().optional(),
  category: z.string().min(1).optional(),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'bank']).optional(),
  isRecurring: z.boolean().optional(),
})

export const UpdateTransactionSchema = CreateTransactionSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  {
    message: 'At least one field is required to update a transaction',
  },
)

