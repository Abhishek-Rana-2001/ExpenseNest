import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  TransactionForm,
  type TransactionFormMode,
} from "./components/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Transaction } from "@/types";

import { useTransactions } from "./useTransactions";
import TransactionsTable from "./components/TransactionsTable";

export default function TransactionsPage() {
  const { data: transactions = [], isLoading, error } = useTransactions();
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<TransactionFormMode>("add");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const editTxnId = searchParams.get("txn");


  // Open the edit dialog for ?txn=ID on initial load (or back/forward nav).
  useEffect(() => {
    if (!editTxnId) return;
    const tx = transactions.find((t) => t._id === editTxnId);
    if (tx) {
      setFormMode("edit");
      setSelectedTransaction(tx);
      setShowForm(true);
    }
  }, [editTxnId, transactions]);

  function openAddForm() {
    setFormMode("add");
    setSelectedTransaction(null);
    setShowForm(true);
  }

  function openEditForm(transaction: Transaction) {
    setFormMode("edit");
    setSelectedTransaction(transaction);
    setShowForm(true);
    setSearchParams({ txn: transaction._id }, { replace: true });
  }

  function handleDialogChange(open: boolean) {
    setShowForm(open);
    if (!open && searchParams.has("txn")) {
      searchParams.delete("txn");
      setSearchParams(searchParams, { replace: true });
    }
  }

  return (
    <div className="space-y-8 bg-white flex-1 h-full p-4">
      <div className="flex justify-between items-center bg-white">
        <div className="max-sm:max-w-4/5">
          <h1 className="sm:text-2xl text-lg font-semibold tracking-tight">
            Transactions
          </h1>
          <p className="text-gray-500 text-sm">
            Reviewing your financial journey for the last 30 days.
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={handleDialogChange}>
          <div className="flex justify-end max-sm:fixed max-sm:bottom-20 max-sm:right-4 max-sm:left-4 z-20">
            <DialogTrigger asChild>
              <Button type="button" className="w-full" onClick={openAddForm}>
                <Plus className="max-sm:size-5" />
                <span className="">Add</span>
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="bg-white border-slate-200">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {formMode === "add" ? "Add Transaction" : "Edit Transaction"}
              </DialogTitle>
              <DialogDescription>
                {formMode === "add"
                  ? "Record a new income or expense in your ledger."
                  : "Update the details of this transaction."}
              </DialogDescription>
            </DialogHeader>
            <TransactionForm
              mode={formMode}
              transaction={selectedTransaction}
              onSuccess={() => handleDialogChange(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {error && <p className="text-sm text-red-500">{error.message}</p>}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {isLoading ? (
          <p className="p-6 text-sm text-slate-400">Loading transactions…</p>
        ) : (
          <TransactionsTable
            transactions={transactions}
            onRowClick={openEditForm}
          />
        )}
      </div>
    </div>
  );
}
