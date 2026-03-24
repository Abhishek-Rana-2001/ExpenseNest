import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { api, normalizeError } from '../../../lib/api'
import { Button } from '@/components/ui/button'
import {
  createTransactionSchema,
  type CreateTransactionInput,
} from '../schema'

export type TransactionFormMode = 'add' | 'edit'

type TransactionForEdit = {
  _id: string
  amount: number
  currency: string
  type: 'income' | 'expense'
  description?: string
  category?: string
  date: string
  paymentMethod?: 'cash' | 'upi' | 'card' | 'bank'
  isRecurring?: boolean
}

type TransactionFormProps = {
  mode: TransactionFormMode
  transaction?: TransactionForEdit | null
  onSuccess?: () => void | Promise<void>
}

const defaultFormValues: Omit<CreateTransactionInput, 'amount'> = {
  type: 'expense',
  currency: 'INR',
  description: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash',
  isRecurring: false,
}

function toUtcNoonIsoString(date?: string) {
  if (!date) return undefined
  return `${date}T12:00:00.000Z`
}

export function TransactionForm({
  mode,
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateTransactionInput>({
    resolver: zodResolver(createTransactionSchema) as never,
    defaultValues: defaultFormValues as Partial<CreateTransactionInput>,
  })

  useEffect(() => {
    setSubmitError(null)

    if (mode === 'edit' && transaction) {
      reset({
        amount: transaction.amount,
        type: transaction.type,
        currency: transaction.currency || 'INR',
        description: transaction.description || '',
        category: transaction.category || '',
        date: transaction.date ? transaction.date.slice(0, 10) : '',
        paymentMethod: transaction.paymentMethod || 'cash',
        isRecurring: Boolean(transaction.isRecurring),
      })
      return
    }

    reset(defaultFormValues as Partial<CreateTransactionInput>)
  }, [mode, transaction, reset])

  async function onSubmit(data: CreateTransactionInput) {
    try {
      setSubmitError(null)
      const payload = {
        amount: data.amount,
        type: data.type,
        currency: data.currency,
        description: data.description || undefined,
        category: data.category || undefined,
        date: toUtcNoonIsoString(data.date),
        paymentMethod: data.paymentMethod,
        isRecurring: data.isRecurring,
      }
      if (mode === 'edit' && transaction?._id) {
        await api.patch(`/transactions/${transaction._id}`, payload)
      } else {
        await api.post('/transactions', payload)
      }
      reset(defaultFormValues as Partial<CreateTransactionInput>)
      await onSuccess?.()
    } catch (err) {
      const normalizedError = normalizeError(err)
      setSubmitError(normalizedError.message)
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="rounded-xl border border-border bg-card p-6 text-card-foreground"
    >
      <input type="hidden" {...register('currency')} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-foreground"
          >
            Amount *
          </label>
          <input
            id="amount"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('amount', { valueAsNumber: true })}
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-400">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-foreground"
          >
            Type *
          </label>
          <select
            id="type"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('type')}
          >
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-foreground"
          >
            Description
          </label>
          <input
            id="description"
            type="text"
            placeholder="e.g. Groceries"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('description')}
          />
        </div>

        <div>
          <label
            htmlFor="category"
            className="block text-sm font-medium text-foreground"
          >
            Category
          </label>
          <input
            id="category"
            type="text"
            placeholder="e.g. Food"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('category')}
          />
        </div>

        <div>
          <label
            htmlFor="date"
            className="block text-sm font-medium text-foreground"
          >
            Date
          </label>
          <input
            id="date"
            type="date"
            max={new Date().toISOString().slice(0, 10) || undefined}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('date')}
          />
        </div>

        <div>
          <label
            htmlFor="paymentMethod"
            className="block text-sm font-medium text-foreground"
          >
            Payment method
          </label>
          <select
            id="paymentMethod"
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('paymentMethod')}
          >
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
          </select>
        </div>

        <div className="flex items-center gap-2 max-sm:justify-end">
          <input
            id="isRecurring"
            type="checkbox"
            className="h-4 w-4 rounded border-input bg-background text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            {...register('isRecurring')}
          />
          <label
            htmlFor="isRecurring"
            className="text-sm font-medium text-foreground"
          >
            Recurring
          </label>
        </div>
      </div>

      {submitError && (
        <p className="mt-4 text-sm text-destructive">{submitError}</p>
      )}

      <div className="mt-4 flex justify-center">
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? mode === 'edit'
              ? 'Saving…'
              : 'Adding…'
            : mode === 'edit'
              ? 'Save changes'
              : 'Add transaction'}
        </Button>
      </div>
    </form>
  )
}
