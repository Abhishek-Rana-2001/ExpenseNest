import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Transaction } from '@/types'

export const TRANSACTIONS_QUERY_KEY = ['transactions'] as const

export function useTransactions() {
  return useQuery({
    queryKey: TRANSACTIONS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<{ ok: boolean; data: Transaction[] }>(
        '/transactions',
      )
      return res.data?.data ?? []
    },
  })
}
