import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Receipt,
  Wallet,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/currencies'

import { useBudget } from './useBudget'
import { Button } from '@/components/ui/button'

const MONTH_LABEL = (year: number, month: number) =>
  new Date(year, month - 1, 1).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  })

const formatTxDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })

const PAYMENT_LABEL: Record<string, string> = {
  cash: 'Cash',
  upi: 'UPI',
  card: 'Card',
  bank: 'Bank',
}

export default function BudgetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  // Default to current month; arrows let user step through periods.
  const now = new Date()
  const [period, setPeriod] = useState({
    year: now.getFullYear(),
    month: now.getMonth() + 1,
  })

  const { data: budget, isLoading, error } = useBudget(
    id,
    period.year,
    period.month,
  )

  function shiftMonth(delta: number) {
    setPeriod(({ year, month }) => {
      const m = month + delta
      if (m < 1) return { year: year - 1, month: 12 }
      if (m > 12) return { year: year + 1, month: 1 }
      return { year, month: m }
    })
  }

  // For the "days left / days passed" stats (only meaningful for current month).
  const isCurrentMonth =
    period.year === now.getFullYear() && period.month === now.getMonth() + 1
  const daysInMonth = useMemo(
    () => new Date(period.year, period.month, 0).getDate(),
    [period.year, period.month],
  )
  const daysPassed = isCurrentMonth ? now.getDate() : daysInMonth
  const daysLeft = Math.max(0, daysInMonth - daysPassed)

  if (isLoading || !budget) {
    return (
      <div className="p-6">
        {error ? (
          <p className="text-sm text-rose-600">{error.message}</p>
        ) : (
          <p className="text-sm text-slate-400">Loading budget…</p>
        )}
      </div>
    )
  }

  const isOver = budget.percent > 100
  const isWarning = budget.percent >= 80 && budget.percent <= 100
  const barColor = isOver
    ? 'bg-rose-500'
    : isWarning
      ? 'bg-amber-500'
      : 'bg-emerald-500'
  const accentText = isOver
    ? 'text-rose-600'
    : isWarning
      ? 'text-amber-600'
      : 'text-emerald-600'

  const category =
    typeof budget.categoryId === 'object' ? budget.categoryId : null
  const avgPerDay = daysPassed > 0 ? budget.spent / daysPassed : 0

  return (
    <div className="mx-auto w-full space-y-6 p-4 sm:p-6">
      {/* Back nav */}
      <div className='flex justify-between items-center'>
        <button
          type="button"
          onClick={() => navigate('/app/budgets')}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-800"
        >
          <ArrowLeft size={14} />
          All budgets
        </button>

        <Button>Edit</Button>
      </div>

      {/* Hero */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        {/* Category line */}
        <div className="flex items-center gap-2">
          {category?.color && (
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: category.color }}
              aria-hidden
            />
          )}
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {category?.name ?? 'Uncategorized'}
          </p>
        </div>

        {/* Month switcher */}
        <div className="mt-3 flex items-center gap-1">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Previous month"
            className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium text-slate-700">
            {MONTH_LABEL(period.year, period.month)}
          </span>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Next month"
            className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Headline numbers */}
        <div className="mt-6">
          <p className="text-4xl font-semibold tabular-nums tracking-tight text-slate-900 sm:text-5xl">
            {formatCurrency(budget.spent, budget.currency)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            of{' '}
            <span className="font-medium text-slate-700 tabular-nums">
              {formatCurrency(budget.amount, budget.currency)}
            </span>{' '}
            ·{' '}
            <span className={cn('font-semibold', accentText)}>
              {Math.round(budget.percent)}% spent
            </span>
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn('h-full rounded-full transition-all', barColor)}
            style={{ width: `${Math.min(100, budget.percent)}%` }}
          />
        </div>

        {/* Remaining / over caption */}
        <p className="mt-3 text-sm">
          {isOver ? (
            <span className="font-medium text-rose-600">
              Over by{' '}
              {formatCurrency(Math.abs(budget.remaining), budget.currency)}
            </span>
          ) : (
            <>
              <span className="font-medium text-slate-800 tabular-nums">
                {formatCurrency(budget.remaining, budget.currency)}
              </span>{' '}
              <span className="text-slate-500">remaining this month</span>
            </>
          )}
        </p>
      </section>

      {/* Stat strip */}
      <section className="grid grid-cols-3 gap-3">
        <StatCell
          icon={Receipt}
          label="Transactions"
          value={String(budget.transactionCount)}
        />
        <StatCell
          icon={Wallet}
          label="Avg / day"
          value={formatCurrency(avgPerDay, budget.currency)}
        />
        <StatCell
          icon={CalendarDays}
          label={isCurrentMonth ? 'Days left' : 'Days in month'}
          value={isCurrentMonth ? String(daysLeft) : String(daysInMonth)}
        />
      </section>

      {/* Transactions list */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-slate-800">Transactions</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            All expenses in {category?.name ?? 'this category'} for{' '}
            {MONTH_LABEL(period.year, period.month)}
          </p>
        </div>

        {budget.transactions.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm font-medium text-slate-700">
              No spending yet
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Transactions in this category will appear here.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {budget.transactions.map((tx) => (
              <li
                key={tx._id}
                onClick={() => navigate(`/app/transactions/${tx._id}`)}
                className="group flex cursor-pointer items-center gap-4 px-5 py-3.5 transition-colors hover:bg-slate-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-800">
                    {tx.description || '—'}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatTxDate(tx.date)} ·{' '}
                    {PAYMENT_LABEL[tx.paymentMethod] ?? tx.paymentMethod}
                  </p>
                </div>
                <span className="whitespace-nowrap text-sm font-semibold tabular-nums text-rose-600">
                  -{formatCurrency(tx.amount, tx.currency)}
                </span>
                <ArrowRight
                  size={14}
                  className="shrink-0 text-slate-300 transition-colors group-hover:text-slate-500"
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function StatCell({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Receipt
  label: string
  value: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="inline-flex size-7 items-center justify-center rounded-md bg-slate-50 text-slate-500">
        <Icon size={14} />
      </div>
      <p className="mt-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-base font-semibold tabular-nums text-slate-900">
        {value}
      </p>
    </div>
  )
}
