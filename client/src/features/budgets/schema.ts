import { z } from 'zod'

const currencyEnum = z.enum(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'])

export const createBudgetSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.coerce
    .number()
    .refine((n) => !Number.isNaN(n), 'Amount is required')
    .positive('Amount must be greater than 0'),
  currency: currencyEnum,
})

export type CreateBudgetInput = z.input<typeof createBudgetSchema>
export type CreateBudgetOutput = z.output<typeof createBudgetSchema>
