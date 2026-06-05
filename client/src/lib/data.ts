import {
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export type SummaryCard = {
  title: string
  value: string
  subtitle: string
  Icon: LucideIcon
  iconBg: string
  iconColor: string
  delta: { value: string; direction: 'up' | 'down' }
}

export const summaryCards: SummaryCard[] = [
  {
    title: 'Total Balance',
    value: '$12,450',
    subtitle: 'Available funds',
    Icon: Wallet,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    delta: { value: '+4.2%', direction: 'up' },
  },
  {
    title: 'Income (30d)',
    value: '$8,320',
    subtitle: 'Total earnings',
    Icon: TrendingUp,
    iconBg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
    delta: { value: '+12.5%', direction: 'up' },
  },
  {
    title: 'Expenses (30d)',
    value: '$5,740',
    subtitle: 'Total spendings',
    Icon: TrendingDown,
    iconBg: 'bg-rose-50',
    iconColor: 'text-rose-600',
    delta: { value: '-3.1%', direction: 'down' },
  },
  {
    title: 'Savings Rate',
    value: '31%',
    subtitle: 'Income saved this month',
    Icon: PiggyBank,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
    delta: { value: '+2.4%', direction: 'up' },
  },
]

export type RecentTransaction = {
  id: string
  date: string
  description: string
  category: string
  categoryClass: string
  amount: string
  type: 'income' | 'expense'
}

export const recentTransactions: RecentTransaction[] = [
  {
    id: 'txn-001',
    date: 'Mar 8, 2026',
    description: 'Groceries',
    category: 'Food',
    categoryClass: 'bg-amber-50 text-amber-700',
    amount: '-$84.20',
    type: 'expense',
  },
  {
    id: 'txn-002',
    date: 'Mar 7, 2026',
    description: 'Freelance payment',
    category: 'Income',
    categoryClass: 'bg-emerald-50 text-emerald-700',
    amount: '+$1,250.00',
    type: 'income',
  },
  {
    id: 'txn-003',
    date: 'Mar 5, 2026',
    description: 'Gym membership',
    category: 'Health',
    categoryClass: 'bg-sky-50 text-sky-700',
    amount: '-$49.99',
    type: 'expense',
  },
  {
    id: 'txn-004',
    date: 'Mar 2, 2026',
    description: 'Coffee shop',
    category: 'Dining',
    categoryClass: 'bg-orange-50 text-orange-700',
    amount: '-$14.50',
    type: 'expense',
  },
]
