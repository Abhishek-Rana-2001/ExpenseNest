import { useQuery } from '@tanstack/react-query'

import { api } from '@/lib/api'
import type { Category } from '@/types'

export const CATEGORIES_QUERY_KEY = ['categories'] as const

export function useCategories() {
  return useQuery({
    queryKey: CATEGORIES_QUERY_KEY,
    queryFn: async () => {
      const res = await api.get<{ ok: boolean; data: Category[] }>(
        '/categories',
      )
      return res.data?.data ?? []
    },
    staleTime: 60_000, // categories rarely change; serve from cache for a minute
  })
}
