import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type {
  Transaction,
  filterTransactions,
  TransactionSort,
} from '@/types'

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const

const DEFAULT_SORT: TransactionSort = { field: 'date', order: 'desc' }

export function useTransactions(
  {
    filters,
    sort = DEFAULT_SORT,
  }: { filters?: filterTransactions; sort?: TransactionSort } = {},
) {
  return useQuery({
    // Including filters AND sort in the key so react-query refetches when either changes.
    queryKey: [
      'transactions',
      filters?.from?.toISOString() ?? null,
      filters?.to?.toISOString() ?? null,
      filters?.search ?? null,
      sort.field,
      sort.order,
    ],
    queryFn: async () => {
      // Build params manually so nulls are dropped and Dates become ISO strings.
      const params: Record<string, string> = {}
      if (filters?.from) {
        const startOfDay = new Date(filters.from)
        startOfDay.setHours(0, 0, 0, 0)
        params.from = startOfDay.toISOString()
      }
      if (filters?.to) {
        const endOfDay = new Date(filters.to)
        endOfDay.setHours(23, 59, 59, 999)
        params.to = endOfDay.toISOString()
      }
      if (filters?.search) params.search = filters.search
      params.sort = sort.field
      params.order = sort.order

      const res = await api.get<{ ok: boolean; data: Transaction[] }>(
        '/transactions',
        { params },
      )
      return res.data?.data ?? []
    },
  })
}
