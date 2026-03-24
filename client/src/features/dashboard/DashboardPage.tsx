import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import DashboardChart from './components/DashboardChart'
import { recentTransactions, summaryCards } from '@/lib/data'
import { useAuth } from '@/context/AuthContext'
import { Bell, Settings } from 'lucide-react'



export function DashboardPage() {
  const {user} = useAuth()

  return (
    <div className="space-y-10  w-full h-full">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back , {user?.name || ""}</h1>
          <p className="text-sm text-slate-600">Your financial sanctuary is in perfect order.</p>
        </div>
        <div className="flex items-center gap-4">
          <button className='p-2 rounded-full bg-white group cursor-pointer'>
            <Bell size={20} className='group-hover:animate-vibrate duration-300 transition-all ' />
          </button>
          <button  className='p-2 rounded-full bg-white group cursor-pointer'>
            <Settings size={20} className='group-hover:rotate-180 duration-300 transition-all' />
          </button>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <div
            key={card.title}
            className={`rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-1 ring-slate-200 transition hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.title}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-900">{card.value}</p>
                <p className="mt-1 text-sm text-slate-500">{card.subtitle}</p>
              </div>
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br ${card.color} text-white shadow-sm`}
              >
                {card.title === 'Total Balance' ? '💰' : card.title === 'Income (30d)' ? '📈' : card.title === 'Expenses (30d)' ? '📉' : '🏦'}
              </span>
            </div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">Monthly Breakdown</h2>
          <p className="mt-1 text-sm text-slate-500">Income, expenses, and savings for the last 3 months.</p>
          <div className="mt-5">
            <DashboardChart />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/70 p-6 shadow-sm ring-1 ring-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900">Recent Transactions</h2>
            <span className="text-sm text-slate-500">Showing last {recentTransactions.length}</span>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => (
                  <tr key={tx.id} className="border-t border-slate-100 even:bg-slate-50">
                    <td className="px-4 py-3 text-slate-600">{tx.date}</td>
                    <td className="px-4 py-3 text-slate-800">{tx.description}</td>
                    <td className="px-4 py-3 text-slate-600">{tx.category}</td>
                    <td
                      className={`px-4 py-3 text-right font-semibold ${
                        tx.type === 'income' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {tx.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  )
}


