import { z } from 'zod'

export const CreateBudgetSchema = z.object({
  category: z.string().min(1),
  amount: z.number().positive(),
  currency: z.enum(['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']),
})

export const UpdateBudgetSchema = CreateBudgetSchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  { message: 'At least one field is required to update a budget' },
)
