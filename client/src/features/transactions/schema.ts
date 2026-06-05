import { z } from 'zod'

export const paymentMethodSchema = z.enum(['cash', 'upi', 'card', 'bank'])
export type PaymentMethod = z.infer<typeof paymentMethodSchema>
export const paymentMethods = paymentMethodSchema.options

export const transactionTypeSchema = z.enum(['income', 'expense'])
export type TransactionType = z.infer<typeof transactionTypeSchema>
export const transactionTypes = transactionTypeSchema.options

export const createTransactionSchema = z.object({
  amount: z.coerce
    .number()
    .refine((n) => !Number.isNaN(n), 'Amount is required')
    .positive('Amount must be greater than 0'),
  type: transactionTypeSchema,
  currency: z.string(),
  description: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  paymentMethod: paymentMethodSchema,
  isRecurring: z.boolean(),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export type CreateTransactionInput = z.input<typeof createTransactionSchema>
export type CreateTransactionOutput = z.output<typeof createTransactionSchema>
export type UpdateTransactionInput = z.input<typeof updateTransactionSchema>
