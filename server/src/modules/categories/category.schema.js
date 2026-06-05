import { z } from 'zod'

const hexColor = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a hex color (e.g. #f59e0b)')

export const CreateCategorySchema = z.object({
  name: z.string().min(1).max(40),
  color: hexColor.optional(),
  icon: z.string().min(1).max(40).optional(),
})

export const UpdateCategorySchema = CreateCategorySchema.partial().refine(
  (input) => Object.keys(input).length > 0,
  { message: 'At least one field is required to update a category' },
)
