import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import StatCard from './components/DashboardBalanceCard'
import { useFetchCategoryExpenseBreakdown } from '@/hooks/useFetchCategoryExpenseBreakdown'
import CategoryExpenseChart from './components/CategoryExpenseChart'

export function DashboardPage() {

  const {data, isLoading, error} = useQuery({
    queryKey:["dashboardSummary"],
    queryFn: async()=>{
      const res = await api.get("/summary")
      return res.data
    }
  })
  const {data:categoryExpenseBreakdown, isLoading: isCategoryExpenseBreakdownLoading, error:categoryExpenseBreakdownError} = useFetchCategoryExpenseBreakdown()

  if(isLoading) {
    return <div>Loading...</div>
  }

  if(error) {
    return <div>Error loading dashboard summary</div>
  }


  
  return (
   <div className='w-full'>
        <div className='grid grid-cols-12 gap-6 p-4 mt-4'>
          <div className='col-span-4'>
            <StatCard amount={data?.data[0]?.balance || 0} trend="Up" title='Current Balance' period='Today' />
          </div>

          <div className='col-span-8'>
            {isCategoryExpenseBreakdownLoading ? (
              <div className='flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400'>
                Loading chart…
              </div>
            ) : categoryExpenseBreakdownError ? (
              <div className='flex h-80 items-center justify-center rounded-2xl border border-rose-200 bg-rose-50 text-sm text-rose-700'>
                Failed to load expense breakdown
              </div>
            ) : (
              <CategoryExpenseChart data={categoryExpenseBreakdown} />
            )}
          </div>
        </div>
   </div>
  )
}
