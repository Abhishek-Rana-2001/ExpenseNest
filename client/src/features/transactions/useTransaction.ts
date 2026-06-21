import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Transaction } from '@/types'

export const transactionQueryKey = (id?: string) =>
  ['transaction', id] as const

export function useTransaction(id?: string) {
  return useQuery({
    queryKey: transactionQueryKey(id),
    enabled: !!id,
    queryFn: async () => {
      const res = await api.get<{ ok: boolean; data: Transaction }>(
        `/transactions/${id}`,
      )
      return res.data.data
    },
  })
}
