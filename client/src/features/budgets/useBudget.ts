import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Budget, Transaction } from '@/types'

export type BudgetDetail = Budget & {
  period: {
    year: number
    month: number
    start: string
    end: string
  }
  spent: number
  remaining: number
  percent: number
  transactionCount: number
  transactions: Transaction[]
}

export const budgetQueryKey = (id?: string, year?: number, month?: number) =>
  ['budget', id, year ?? null, month ?? null] as const

export function useBudget(id?: string, year?: number, month?: number) {
  return useQuery({
    queryKey: budgetQueryKey(id, year, month),
    enabled: !!id,
    queryFn: async () => {
      const params = new URLSearchParams()
      if (year) params.set('year', String(year))
      if (month) params.set('month', String(month))
      const qs = params.toString() ? `?${params.toString()}` : ''
      const res = await api.get<{ ok: boolean; data: BudgetDetail }>(
        `/budgets/${id}${qs}`,
      )
      return res.data.data
    },
  })
}
