import { useMemo, useState } from "react";
import {
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import type { Budget, Transaction } from "@/types";
import { useTransactions } from "@/features/transactions/useTransactions";

import { type BudgetFormMode } from "./components/BudgetForm";
import { useBudgets } from "./useBudgets";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AddBudgetDialog from "./components/AddBudgetDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/lib/api";
import { DeleteDialog } from "./components/DeleteBudgetDialog";
import { useQueryClient } from "@tanstack/react-query";

type SpentByCategoryId = Record<string, number>;

function isCurrentMonth(iso: string): boolean {
  const d = new Date(iso);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

/** Group expenses by categoryId. Falls back to the legacy category-name key
 *  so transactions that haven't been migrated yet still count. */
function computeSpent(transactions: Transaction[]): SpentByCategoryId {
  const acc: SpentByCategoryId = {};
  for (const tx of transactions) {
    if (tx.type !== "expense" || !isCurrentMonth(tx.date)) continue;
    const txWithId = tx as Transaction & { categoryId?: string };
    const key = txWithId.categoryId ?? tx.category?.toLowerCase() ?? "";
    if (!key) continue;
    acc[key] = (acc[key] ?? 0) + tx.amount;
  }
  return acc;
}

function getBudgetCategory(budget: Budget) {
  if (typeof budget.categoryId === "object" && budget.categoryId) {
    return budget.categoryId;
  }
  return null;
}

function getBudgetKey(budget: Budget) {
  if (typeof budget.categoryId === "string") return budget.categoryId;
  if (typeof budget.categoryId === "object" && budget.categoryId)
    return budget.categoryId._id;
  return "";
}

export default function BudgetsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { pathname } = useLocation();
  const budgetsQuery = useBudgets();
  const transactionsQuery = useTransactions();

  const budgets = budgetsQuery.data ?? [];
  const transactions = transactionsQuery.data ?? [];
  const isLoading = budgetsQuery.isLoading || transactionsQuery.isLoading;
  const loadError =
    budgetsQuery.error?.message ?? transactionsQuery.error?.message ?? null;

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<BudgetFormMode>("add");
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [budgetToDelete, setBudgetToDelete] = useState<Budget | null>(null);

  const spentByCategory = useMemo(
    () => computeSpent(transactions),
    [transactions],
  );

  const monthLabel = useMemo(
    () =>
      new Date().toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      }),
    [],
  );

  function openAddForm() {
    setFormMode("add");
    setSelectedBudget(null);
    setShowForm(true);
  }

  function openEditForm(budget: Budget) {
    setFormMode("edit");
    setSelectedBudget(budget);
    setShowForm(true);
  }

  const handleDelete = async (budget: Budget) => {
    try {
      await api.delete(`/budgets/${budget._id}`);
      budgetsQuery.refetch();
    } catch (error) {
      console.log(error);
    }
  };
  const isNotChildRoute = pathname.endsWith(`budgets`);

  return (
    <>
      <DeleteDialog
        setBudgetToDelete={setBudgetToDelete}
        budgetToDelete={budgetToDelete}
        onDelete={handleDelete}
      />
      {isNotChildRoute ? (
        <div className="space-y-6 p-4">
          <header className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
                Budgets
              </h1>
              <p className="text-sm text-slate-500">
                Monthly spending limits for {monthLabel}.
              </p>
            </div>
            <AddBudgetDialog
              selectedBudget={selectedBudget}
              openAddForm={openAddForm}
              showForm={showForm}
              setShowForm={setShowForm}
              formMode={formMode}
            />
          </header>

          {loadError && <p className="text-sm text-red-500">{loadError}</p>}

          {isLoading ? (
            <p className="text-sm text-slate-400">Loading budgets…</p>
          ) : budgets.length === 0 ? (
            <EmptyState onAdd={openAddForm} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {budgets.map((budget) => (
                <BudgetCard
                  key={budget._id}
                  budget={budget}
                  spent={spentByCategory[getBudgetKey(budget)] ?? 0}
                  onEdit={() => navigate(`/app/budgets/${budget._id}`)}
                  onDelete={(budget)=>setBudgetToDelete(budget)}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <Outlet />
      )}
    </>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/40 px-6 py-12 text-center">
      <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Wallet size={20} />
      </span>
      <h3 className="mt-3 text-sm font-medium text-slate-800">
        No budgets yet
      </h3>
      <p className="mt-1 text-xs text-slate-500">
        Set monthly limits per category to keep your spending on track.
      </p>
      <Button type="button" onClick={onAdd} className="mt-4">
        <Plus />
        Add your first budget
      </Button>
    </div>
  );
}

function BudgetCard({
  budget,
  spent,
  onEdit,
  onDelete,
}: {
  budget: Budget;
  spent: number;
  onEdit: () => void;
  onDelete: (budget: Budget) => void;
}) {
  const percent = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
  const remaining = budget.amount - spent;
  const isOver = percent > 100;
  const isWarning = percent >= 80 && percent <= 100;

  const barColor = isOver
    ? "bg-rose-500"
    : isWarning
      ? "bg-amber-500"
      : "bg-emerald-500";

  const ringColor = isOver
    ? "text-rose-600"
    : isWarning
      ? "text-amber-600"
      : "text-emerald-600";

  return (
    <div
      role="button"
      tabIndex={0}
      className="group flex flex-col cursor-pointer gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {getBudgetCategory(budget)?.color && (
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{
                backgroundColor: getBudgetCategory(budget)?.color ?? undefined,
              }}
              aria-hidden
            />
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold capitalize text-slate-800">
              {getBudgetCategory(budget)?.name ?? "Uncategorized"}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">Monthly limit</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold tabular-nums",
            ringColor,
          )}
        >
          {Math.round(percent)}%
        </span>
      </div>

      <div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-2xl font-semibold tabular-nums text-slate-900">
            {formatCurrency(spent, budget.currency)}
          </span>
          <span className="text-sm text-slate-500 tabular-nums">
            of {formatCurrency(budget.amount, budget.currency)}
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={cn("h-full rounded-full transition-all", barColor)}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>

      <p className="text-xs text-slate-500 flex justify-between">
        {isOver ? (
          <span className="font-medium text-rose-600">
            Over by {formatCurrency(Math.abs(remaining), budget.currency)}
          </span>
        ) : (
          <>
            <span className="font-medium text-slate-700">
              {formatCurrency(remaining, budget.currency)}
            </span>{" "}
            left this month
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              aria-label="Row actions"
              className="inline-flex size-7 items-center justify-center rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            >
              <MoreHorizontal size={16} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-32">
            <DropdownMenuItem
              onSelect={onEdit}
              className="cursor-pointer"
            >
              <Pencil size={14} />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => onDelete(budget)}
              className="cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700"
            >
              <Trash2 size={14} />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </p>
    </div>
  );
}
