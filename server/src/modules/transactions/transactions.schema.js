import { z } from 'zod'

export const CreateTransactionSchema = z.object({
  amount: z.number(),
  currency: z.string().min(1).default('USD'),
  type: z.enum(['income', 'expense']),
  description: z.string().min(1).optional(),
  date: z.string().datetime().optional(),
  category: z.string().min(1).optional(),
})

