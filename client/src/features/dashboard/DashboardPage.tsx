import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import StatCard from './components/DashboardBalanceCard'
import { useFetchCategoryExpenseBreakdown } from '@/hooks/useFetchCategoryExpenseBreakdown'
import CategoryExpenseChart from './components/CategoryExpenseChart'
import { useAuth } from '@/context/AuthContext'
import Spinner from '@/components/animated/Spinner'

export function DashboardPage() {
  const {user} = useAuth();

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
          <div className='lg:col-span-3 md:col-span-4 col-span-12'>
            <StatCard currency={user?.baseCurrency} amount={data?.data[0]?.balance || 0} trend="Up" title='Current Balance' period='Today' />
          </div>
           <div className='lg:col-span-3 md:col-span-4 col-span-12'>
            <StatCard currency={user?.baseCurrency} amount={data?.data[0]?.expense || 0} trend="Up" title='Expense' period='Today' />
           </div>
            <div className='lg:col-span-3 md:col-span-4 col-span-12'>
            <StatCard currency={user?.baseCurrency} amount={data?.data[0]?.income || 0} trend="Up" title='Income' period='Today' />
            </div>

          <div className='md:col-span-8 lg:col-span-5 col-span-12 border border-neutral-200 flex flex-col justify-center items-center p-2 rounded-lg'>
            <h2 className='text-xl font-medium'>Expense By Categories</h2>
            {isCategoryExpenseBreakdownLoading ? (
              <div className='flex h-80 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm text-slate-400'>
                <Spinner />
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
