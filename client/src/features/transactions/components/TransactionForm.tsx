import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { api } from '../../../lib/api'
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
import { DatePickerSimple } from '@/components/ui/DatePickerSimple'
import { useAuth } from '@/context/AuthContext'
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  getCurrencySymbol,
} from '@/lib/currencies'
import { cn } from '@/lib/utils'
import { CategoryCombobox } from '@/features/categories/CategoryCombobox'
import { CATEGORIES_QUERY_KEY } from '@/features/categories/useCategories'
import { TRANSACTIONS_QUERY_KEY } from '../useTransactions'
import {
  createTransactionSchema,
  paymentMethods,
  type PaymentMethod,
} from '../schema'
import type { Transaction } from '@/types'
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CreditCard,
  Landmark,
  RotateCw,
  Smartphone,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export type TransactionFormMode = 'add' | 'edit'

type TransactionForEdit = Pick<
  Transaction,
  | '_id'
  | 'amount'
  | 'currency'
  | 'type'
  | 'description'
  | 'category'
  | 'date'
  | 'paymentMethod'
  | 'isRecurring'
>

type TransactionFormProps = {
  mode: TransactionFormMode
  transaction?: TransactionForEdit | null
  onSuccess?: () => void | Promise<void>
}

type FormInput = z.input<typeof createTransactionSchema>
type FormOutput = z.output<typeof createTransactionSchema>

const makeDefaultFormValues = (currency: string): FormInput => ({
  amount: '',
  type: 'expense',
  currency,
  description: '',
  category: '',
  date: new Date().toISOString().slice(0, 10),
  paymentMethod: 'cash',
  isRecurring: false,
})

const paymentMethodMeta: Record<
  PaymentMethod,
  { label: string; Icon: LucideIcon }
> = {
  cash: { label: 'Cash', Icon: Banknote },
  upi: { label: 'UPI', Icon: Smartphone },
  card: { label: 'Card', Icon: CreditCard },
  bank: { label: 'Bank', Icon: Landmark },
}

const inputClass =
  'block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 transition focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/30'

function toUtcNoonIsoString(date?: string) {
  if (!date) return undefined
  return `${date}T12:00:00.000Z`
}

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

export function TransactionForm({
  mode,
  transaction,
  onSuccess,
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const { user } = useAuth()
  const baseCurrency = user?.baseCurrency ?? DEFAULT_CURRENCY
  const defaultFormValues = makeDefaultFormValues(baseCurrency)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: defaultFormValues,
  })

  const type = watch('type')
  const paymentMethod = watch('paymentMethod')
  const currency = watch('currency') ?? baseCurrency

  const saveMutation = useMutation({
    mutationFn: async (data: FormOutput) => {
      const payload = {
        ...data,
        description: data.description || undefined,
        category: data.category || undefined,
        date: toUtcNoonIsoString(data.date),
      }
      if (mode === 'edit' && transaction?._id) {
        await api.patch(`/transactions/${transaction._id}`, payload)
      } else {
        await api.post('/transactions', payload)
      }
    },
    onSuccess: () => {
      // Writing a transaction may have created a new Category via findOrCreate.
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      queryClient.invalidateQueries({ queryKey: CATEGORIES_QUERY_KEY })
      reset(defaultFormValues)
      onSuccess?.()
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!transaction?._id) return
      await api.delete(`/transactions/${transaction._id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY })
      onSuccess?.()
    },
  })

  const submitError =
    saveMutation.error?.message ?? deleteMutation.error?.message ?? null
  const isSubmitting = saveMutation.isPending
  const isDeleting = deleteMutation.isPending

  useEffect(() => {
    saveMutation.reset()
    deleteMutation.reset()
    if (mode === 'edit' && transaction) {
      reset({
        amount: transaction.amount,
        type: transaction.type,
        currency: transaction.currency || 'INR',
        description: transaction.description ?? '',
        category: transaction.category ?? '',
        date: transaction.date ? transaction.date.slice(0, 10) : '',
        paymentMethod: transaction.paymentMethod,
        isRecurring: transaction.isRecurring,
      })
      return
    }
    reset(defaultFormValues)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, transaction, reset])

  function handleKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key !== 'Enter') return
    const target = e.target as HTMLElement
    // Only intervene for plain text-like inputs; leave checkboxes, buttons,
    // and the date picker alone (Enter on those has its own meaning).
    if (
      !(target instanceof HTMLInputElement) ||
      ['hidden', 'checkbox', 'radio', 'submit', 'button'].includes(target.type)
    ) {
      return
    }
    const fields = Array.from(
      e.currentTarget.querySelectorAll<HTMLInputElement>(
        'input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([disabled])',
      ),
    )
    const next = fields[fields.indexOf(target) + 1]
    if (next) {
      e.preventDefault()
      next.focus()
    }
    // No next field → fall through and let the form submit.
  }

  return (
    <form
      onSubmit={handleSubmit((data) => saveMutation.mutate(data))}
      onKeyDown={handleKeyDown}
      className="space-y-5"
    >

      {/* Type segmented toggle */}
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        <button
          type="button"
          onClick={() =>
            setValue('type', 'expense', { shouldValidate: true })
          }
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            type === 'expense'
              ? 'bg-white text-rose-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <ArrowDownRight size={16} />
          Expense
        </button>
        <button
          type="button"
          onClick={() =>
            setValue('type', 'income', { shouldValidate: true })
          }
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            type === 'income'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700',
          )}
        >
          <ArrowUpRight size={16} />
          Income
        </button>
      </div>

      {/* Amount + currency */}
      <div>
        <Label htmlFor="amount">Amount</Label>
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
              enterKeyHint="next"
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

      {/* Description */}
      <div>
        <Label htmlFor="description">Description</Label>
        <input
          id="description"
          type="text"
          enterKeyHint="next"
          placeholder="e.g. Groceries at Big Bazaar"
          className={cn(inputClass, 'mt-1')}
          {...register('description')}
        />
      </div>

      {/* Category + Date */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="category">Category</Label>
          <div className="mt-1">
            <Controller
              control={control}
              name="category"
              render={({ field }) => (
                <CategoryCombobox
                  id="category"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  placeholder="Pick or create"
                />
              )}
            />
          </div>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <div className="mt-1">
            <Controller
              control={control}
              name="date"
              render={({ field }) => (
                <DatePickerSimple
                  id="date"
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  maxDate={new Date()}
                  placeholder="Pick a date"
                />
              )}
            />
          </div>
        </div>
      </div>

      {/* Payment method chips */}
      <div>
        <Label>Payment method</Label>
        <div className="mt-1 grid grid-cols-4 gap-2">
          {paymentMethods.map((m) => {
            const { Icon, label } = paymentMethodMeta[m]
            const active = paymentMethod === m
            return (
              <button
                key={m}
                type="button"
                onClick={() =>
                  setValue('paymentMethod', m, { shouldValidate: true })
                }
                className={cn(
                  'inline-flex flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2.5 text-xs font-medium transition-colors',
                  active
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50',
                )}
              >
                <Icon size={16} />
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Recurring row */}
      <label className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 bg-slate-50/60 p-3 transition-colors hover:bg-slate-50">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 items-center justify-center rounded-md bg-violet-50 text-violet-600">
            <RotateCw size={16} />
          </span>
          <div>
            <p className="text-sm font-medium text-slate-800">
              Recurring transaction
            </p>
            <p className="text-xs text-slate-500">
              Repeats automatically each month
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
          {...register('isRecurring')}
        />
      </label>

      {submitError && (
        <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {submitError}
        </div>
      )}

      {mode === 'edit' && transaction?._id ? (
        <div className="flex items-center gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                disabled={isSubmitting || isDeleting}
                aria-label="Delete transaction"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              >
                <Trash2 size={16} />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action can't be undone. The transaction will be
                  permanently removed from your records.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
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
          {isSubmitting ? 'Adding…' : 'Add transaction'}
        </Button>
      )}
    </form>
  )
}
