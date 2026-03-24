import { z } from 'zod'

export const createTransactionSchema = z.object({
  amount: z
    .number()
    .refine((n) => !Number.isNaN(n), 'Amount is required')
    .positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  currency: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'bank']),
  isRecurring: z.boolean(),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
