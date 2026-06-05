import { api } from "@/lib/api"
import { useQuery } from "@tanstack/react-query"

export const useFetchCategoryExpenseBreakdown = () => {
    return useQuery({
        queryKey: ['categoryExpenseBreakdown'],
        queryFn : async()=>{
            const res  = await api.get("/summary/categories")
            return res.data.data
        }
    })
  
}

