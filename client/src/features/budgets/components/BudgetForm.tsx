import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { z } from 'zod'
import { Trash2 } from 'lucide-react'

import { api, normalizeError } from '@/lib/api'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { useAuth } from '@/context/AuthContext'
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
} from '@/lib/currencies'
import { cn } from '@/lib/utils'
import type { Budget } from '@/types'
import { CategoryCombobox } from '@/features/categories/CategoryCombobox'
import { CATEGORIES_QUERY_KEY } from '@/features/categories/useCategories'
import { BUDGETS_QUERY_KEY } from '../useBudgets'

import { createBudgetSchema } from '../schema'

export type BudgetFormMode = 'add' | 'edit'

type BudgetFormProps = {
  mode: BudgetFormMode
  budget?: Budget | null
  onSuccess?: () => void | Promise<void>
}

type FormInput = z.input<typeof createBudgetSchema>
type FormOutput = z.output<typeof createBudgetSchema>

const inputClass =
  'block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30'

function Label({
  htmlFor,
  children,
}: {
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[11px] font-semibold uppercase tracking-wider text-slate-500"
    >
      {children}
    </label>
  )
}

const makeDefaults = (currency: FormInput['currency']): FormInput => ({
  category: '',
  amount: '',
  currency,
})

export function BudgetForm({ mode, budget, onSuccess }: BudgetFormProps) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const baseCurrency = user?.baseCurrency ?? DEFAULT_CURRENCY
  const defaults = makeDefaults(baseCurrency)

  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createBudgetSchema),
    defaultValues: defaults,
  })

  const category = watch('category') ?? ''

  const currency = watch('currency') ?? baseCurrency

  useEffect(() => {
    setSubmitError(null)
    if (mode === 'edit' && budget) {
      const populated =
        typeof budget.categoryId === 'object' ? budget.categoryId : null
      reset({
        category: populated?.name ?? '',
        amount: budget.amount,
        currency: budget.currency,
      })
      return
    }
    reset(defaults)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, budget, reset])

  async function handleDelete() {
    if (!budget?._id) return
    try {
      setSubmitError(null)
      setIsDeleting(true)
      await api.delete(`/budgets/${budget._id}`)
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
      await onSuccess?.()
    } catch (err) {
      setSubmitError(normalizeError(err).message)
    } finally {
      setIsDeleting(false)
    }
  }

  async function onSubmit(data: FormOutput) {
    try {
      setSubmitError(null)
      if (mode === 'edit' && budget?._id) {
        await api.patch(`/budgets/${budget._id}`, data)
      } else {
        await api.post('/budgets', data)
      }
      // Writing a budget may have created a new Category via findOrCreate.
      queryClient.invalidateQueries({ queryKey: BUDGETS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      reset(defaults)
      await onSuccess?.()
    } catch (err) {
      setSubmitError(normalizeError(err).message)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <Label htmlFor="category">Category</Label>
        <div className="mt-1">
          <CategoryCombobox
            id="category"
            value={category}
            onChange={(name) =>
              setValue('category', name, { shouldValidate: true })
            }
            placeholder="Pick or create a category"
          />
        </div>
        {errors.category && (
          <p className="mt-1 text-xs text-rose-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Monthly limit</Label>
        <div className="mt-1 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base font-semibold text-slate-500">
              {getCurrencySymbol(currency)}
            </span>
            <input
              id="amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              enterKeyHint="done"
              pattern="[0-9]*[.,]?[0-9]*"
              placeholder="0.00"
              className={cn(inputClass, 'pl-8 text-base font-medium')}
              {...register('amount')}
            />
          </div>
          <select
            aria-label="Currency"
            className={cn(inputClass, 'w-24 cursor-pointer text-sm font-medium')}
            {...register('currency')}
          >
            {SUPPORTED_CURRENCIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.code}
              </option>
            ))}
          </select>
        </div>
        {errors.amount && (
          <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>
        )}
      </div>

      {submitError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      {mode === 'edit' && budget?._id ? (
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting || isDeleting}
                aria-label="Delete budget"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this budget?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action can't be undone. The budget will be removed and no
                  longer track spending against this category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            type="submit"
            disabled={isSubmitting || isDeleting}
            className="flex-1"
          >
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
        </div>
      ) : (
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? 'Adding…' : 'Add budget'}
        </Button>
      )}
    </form>
  )
}
