import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DatePickerSimple } from "@/components/ui/DatePickerSimple";
import { api } from "@/lib/api";
import type {
  filterTransactions,
  Transaction,
  TransactionSort,
} from "@/types";

import { useTransactions, TRANSACTIONS_QUERY_KEY } from "./useTransactions";
import TransactionsTable from "./components/TransactionsTable";
import { useTransactionFormDialog } from "./TransactionFormDialogProvider";

export default function TransactionsPage() {
  const [filters, setFilters] = useState<filterTransactions>({
    from: null,
    to: null,
  });
  const [sort, setSort] = useState<TransactionSort>({
    field: "date",
    order: "desc",
  });
  const { data: transactions = [], isLoading, error } = useTransactions({
    filters,
    sort,
  });
  const [transactionToDelete, setTransactionToDelete] =
    useState<Transaction | null>(null);

  const { openAdd, openEdit } = useTransactionFormDialog();

  const queryClient = useQueryClient();
  const deleteMutation = useMutation({
    mutationFn: async (tx: Transaction) => {
      await api.delete(`/transactions/${tx._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      setTransactionToDelete(null);
    },
  });

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
        <div className="flex justify-end max-sm:fixed max-sm:bottom-20 max-sm:right-4 max-sm:left-4 z-20">
          <Button
            type="button"
            className="w-full"
            onClick={openAdd}
          >
            <Plus className="max-sm:size-5" />
            <span className="">Add</span>
          </Button>
        </div>
      </div>

      {error && <p className="text-sm text-red-500 ">{error.message}</p>}

      <div>
        <FilterSection filters={filters} setFilters={setFilters} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <TransactionsTable
          transactions={transactions}
          onEdit={openEdit}
          onDelete={(tx) => setTransactionToDelete(tx)}
          sort={sort}
          onSortChange={setSort}
          isLoading={isLoading}
        />
      </div>

      <AlertDialog
        open={!!transactionToDelete}
        onOpenChange={(open) => !open && setTransactionToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
            <AlertDialogDescription>
              This action can't be undone. The transaction will be permanently
              removed from your records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (transactionToDelete)
                  deleteMutation.mutate(transactionToDelete);
              }}
              className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

type FilterSectionProps = {
  filters: filterTransactions;
  setFilters: React.Dispatch<React.SetStateAction<filterTransactions>>;
};

// Format Date as YYYY-MM-DD in LOCAL time. Avoids `.toISOString()` which
// converts to UTC and shifts the calendar day for non-UTC timezones.
function toIsoDateString(date: Date | null): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Parse YYYY-MM-DD into a Date at LOCAL midnight on that calendar day.
function fromIsoDateString(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

const FilterSection = ({ filters, setFilters }: FilterSectionProps) => {
  // Local input value — updates on every keystroke for snappy typing.
  const [search, setSearch] = useState(filters.search ?? "");

  // Debounce: push the input value into `filters.search` 300ms after typing stops.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({
        ...prev,
        search: search.trim() || undefined,
      }));
    }, 300);
    return () => clearTimeout(t);
  }, [search, setFilters]);

  // If filters.search gets cleared externally (Clear button), sync the input back.
  useEffect(() => {
    if (!filters.search && search) setSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search]);

  const hasAnyFilter =
    filters.from !== null || filters.to !== null || !!filters.search;

  return (
    <div className="flex items-end gap-3">
      <div>
        <div className="flex gap-2 items-center group border border-gray-300 rounded-lg p-1.5 px-2 focus-within:border-blue-500">
          <Search className="size-4 text-gray-400 group-focus-within:text-blue-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search"
            className="focus:outline-0"
            type="text"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          From
        </label>
        <DatePickerSimple
          className="w-40"
          value={toIsoDateString(filters.from)}
          onChange={(v) =>
            setFilters((prev) => ({ ...prev, from: fromIsoDateString(v) }))
          }
          maxDate={filters.to ?? new Date()}
          placeholder="Start date"
        />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          To
        </label>
        <DatePickerSimple
          className="w-40"
          value={toIsoDateString(filters.to)}
          onChange={(v) =>
            setFilters((prev) => ({ ...prev, to: fromIsoDateString(v) }))
          }
          minDate={filters.from ?? undefined}
          maxDate={new Date()}
          placeholder="End date"
        />
      </div>

      {hasAnyFilter && (
        <Button
          type="button"
          variant="ghost"
          className="text-sm text-slate-600 hover:text-slate-900"
          onClick={() =>
            setFilters({ from: null, to: null, search: undefined })
          }
        >
          Clear
        </Button>
      )}
    </div>
  );
};
