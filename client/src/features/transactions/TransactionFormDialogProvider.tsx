import { createContext, useContext, useState, type ReactNode } from 'react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { Transaction } from '@/types'

import {
  TransactionForm,
  type TransactionFormMode,
} from './components/TransactionForm'

type TransactionFormDialogContextValue = {
  openAdd: () => void
  openEdit: (transaction: Transaction) => void
}

const TransactionFormDialogContext =
  createContext<TransactionFormDialogContextValue | null>(null)

/**
 * Imperative API to open the transaction form dialog from anywhere inside
 * the dashboard. Mount one provider in the layout; consumers use the hook.
 */
export function useTransactionFormDialog() {
  const ctx = useContext(TransactionFormDialogContext)
  if (!ctx) {
    throw new Error(
      'useTransactionFormDialog must be used inside <TransactionFormDialogProvider>',
    )
  }
  return ctx
}

export function TransactionFormDialogProvider({
  children,
}: {
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<TransactionFormMode>('add')
  const [transaction, setTransaction] = useState<Transaction | null>(null)

  const value: TransactionFormDialogContextValue = {
    openAdd: () => {
      setMode('add')
      setTransaction(null)
      setOpen(true)
    },
    openEdit: (tx) => {
      setMode('edit')
      setTransaction(tx)
      setOpen(true)
    },
  }

  return (
    <TransactionFormDialogContext.Provider value={value}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-white border-slate-200">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              {mode === 'add' ? 'Add Transaction' : 'Edit Transaction'}
            </DialogTitle>
            <DialogDescription>
              {mode === 'add'
                ? 'Record a new income or expense in your ledger.'
                : 'Update the details of this transaction.'}
            </DialogDescription>
          </DialogHeader>
          <TransactionForm
            mode={mode}
            transaction={transaction}
            onSuccess={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </TransactionFormDialogContext.Provider>
  )
}
