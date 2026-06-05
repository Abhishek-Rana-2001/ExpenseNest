import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Budget } from '@/types'

export const BUDGETS_QUERY_KEY = ['budgets'] as const

export function useBudgets() {
  return useQuery({
    queryKey: BUDGETS_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<{ ok: boolean; data: Budget[] }>('/budgets')
      return res.data?.data ?? []
    },
  })
}
