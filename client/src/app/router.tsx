import { createBrowserRouter } from 'react-router-dom'

import { AppLayout } from './AppLayout'
import { NotFoundPage } from './NotFoundPage'
import { DashboardPage } from '../features/dashboard/DashboardPage'
import { TransactionsPage } from '../features/transactions/TransactionsPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'transactions', element: <TransactionsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

