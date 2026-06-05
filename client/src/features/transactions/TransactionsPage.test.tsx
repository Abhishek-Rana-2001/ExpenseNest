import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TransactionsPage from './TransactionsPage'

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
  },
  normalizeError: (e: unknown) => ({ message: (e as Error).message ?? 'Error' }),
}))

vi.mock('@/components/table/TransactionsTable', () => ({
  default: ({ transactions }: { transactions: unknown[] }) => (
    <div data-testid="transactions-table">{transactions.length} transactions</div>
  ),
}))

import { api } from '../../lib/api'

const mockGet = api.get as ReturnType<typeof vi.fn>

const mockTransactions = [
  {
    _id: '1',
    userId: 'u1',
    amount: 500,
    currency: 'INR',
    type: 'income',
    description: 'Freelance payment',
    date: '2024-01-15T00:00:00.000Z',
    category: 'Work',
    paymentMethod: 'bank_transfer',
    isRecurring: false,
    createdAt: '2024-01-15T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    __v: 0,
  },
]

describe('TransactionsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the page heading', async () => {
    mockGet.mockResolvedValue({ data: { ok: true, data: [] } })

    render(<TransactionsPage />)

    expect(screen.getByText('Transaction History')).toBeInTheDocument()
  })

  it('passes fetched transactions to the table', async () => {
    mockGet.mockResolvedValue({ data: { ok: true, data: mockTransactions } })

    render(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('1 transactions')).toBeInTheDocument()
    })
  })

  it('shows an error message when the API fails', async () => {
    mockGet.mockRejectedValue(new Error('Network error'))

    render(<TransactionsPage />)

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument()
    })
  })
})
