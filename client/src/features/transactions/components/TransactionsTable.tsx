import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";
import type { Transaction } from "@/types";
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  RotateCw,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

type Props = {
  transactions: Transaction[];
  onRowClick?: (transaction: Transaction) => void;
  pageSize?: number;
};

const PAGE_PARAM = "page";
const DEFAULT_PAGE_SIZE = 10;

const paymentMethodIcons: Record<Transaction["paymentMethod"], LucideIcon> = {
  cash: Banknote,
  upi: Smartphone,
  card: CreditCard,
  bank: Landmark,
};

const paymentMethodLabel: Record<Transaction["paymentMethod"], string> = {
  cash: "Cash",
  upi: "UPI",
  card: "Card",
  bank: "Bank",
};

const categoryColors: Record<string, string> = {
  food: "bg-amber-50 text-amber-700",
  groceries: "bg-amber-50 text-amber-700",
  dining: "bg-orange-50 text-orange-700",
  health: "bg-sky-50 text-sky-700",
  transport: "bg-indigo-50 text-indigo-700",
  travel: "bg-violet-50 text-violet-700",
  entertainment: "bg-pink-50 text-pink-700",
  bills: "bg-rose-50 text-rose-700",
  rent: "bg-rose-50 text-rose-700",
  shopping: "bg-purple-50 text-purple-700",
  salary: "bg-emerald-50 text-emerald-700",
  income: "bg-emerald-50 text-emerald-700",
  freelance: "bg-emerald-50 text-emerald-700",
};

const getCategoryClass = (category: string) =>
  categoryColors[category?.toLowerCase()] ?? "bg-slate-100 text-slate-700";

const formatAmount = (amount: number, currency: string) => {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

/**
 * Produces compact page-number ranges with ellipses for long page lists.
 * total ≤ 7 → show all. Else → 1 … (current-1) current (current+1) … last
 */
function getPageNumbers(current: number, total: number): Array<number | "gap"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | "gap"> = [1];
  if (current > 3) pages.push("gap");
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push("gap");
  pages.push(total);
  return pages;
}

const TransactionsTable = ({
  transactions,
  onRowClick,
  pageSize = DEFAULT_PAGE_SIZE,
}: Props) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const totalPages = Math.max(1, Math.ceil(transactions.length / pageSize));
  const rawPage = Number(searchParams.get(PAGE_PARAM) ?? 1);
  const page = Math.min(
    Math.max(1, Number.isFinite(rawPage) ? rawPage : 1),
    totalPages,
  );

  // Keep the URL in sync if pagination shrinks (e.g., transactions deleted).
  useEffect(() => {
    if (rawPage > totalPages && totalPages > 0) {
      if (totalPages === 1) {
        searchParams.delete(PAGE_PARAM);
      } else {
        searchParams.set(PAGE_PARAM, String(totalPages));
      }
      setSearchParams(searchParams, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const goToPage = (next: number) => {
    if (next < 1 || next > totalPages || next === page) return;
    if (next === 1) {
      searchParams.delete(PAGE_PARAM);
    } else {
      searchParams.set(PAGE_PARAM, String(next));
    }
    setSearchParams(searchParams, { replace: true });
  };

  if (transactions.length === 0) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm font-medium text-slate-700">
          No transactions yet
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Add your first transaction to start tracking your finances.
        </p>
      </div>
    );
  }

  const start = (page - 1) * pageSize;
  const end = Math.min(start + pageSize, transactions.length);
  const visibleTransactions = transactions.slice(start, end);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Description</th>
              <th className="px-5 py-3">Category</th>
              <th className="px-5 py-3">Method</th>
              <th className="px-5 py-3">Date</th>
              <th className="px-5 py-3 text-right">Amount</th>
            </tr>
          </thead>

          <tbody>
            {visibleTransactions.map((tx) => {
              const isIncome = tx.type === "income";
              const PaymentIcon = paymentMethodIcons[tx.paymentMethod];
              const SignIcon = isIncome ? ArrowUpRight : ArrowDownRight;

              return (
                <tr
                  key={tx._id}
                  onClick={onRowClick ? () => onRowClick(tx) : undefined}
                  className={cn(
                    "border-t border-slate-100 transition-colors hover:bg-slate-50",
                    onRowClick && "cursor-pointer",
                  )}
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex size-8 items-center justify-center rounded-full shrink-0",
                          isIncome
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-rose-50 text-rose-600",
                        )}
                        aria-hidden
                      >
                        <SignIcon size={16} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {tx.description || "—"}
                        </p>
                        {tx.isRecurring && (
                          <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-medium text-violet-700">
                            <RotateCw size={10} />
                            Recurring
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize",
                        getCategoryClass(tx.category),
                      )}
                    >
                      {tx.category}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <span className="inline-flex items-center gap-1.5 text-xs text-slate-600">
                      <PaymentIcon size={14} className="text-slate-400" />
                      {paymentMethodLabel[tx.paymentMethod]}
                    </span>
                  </td>

                  <td className="px-5 py-4 whitespace-nowrap text-xs text-slate-600">
                    {formatDate(tx.date)}
                  </td>

                  <td
                    className={cn(
                      "px-5 py-4 text-right font-semibold tabular-nums whitespace-nowrap",
                      isIncome ? "text-emerald-600" : "text-rose-600",
                    )}
                  >
                    {isIncome ? "+" : "-"}
                    {formatAmount(tx.amount, tx.currency)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <TablePagination
          page={page}
          totalPages={totalPages}
          rangeStart={start + 1}
          rangeEnd={end}
          totalItems={transactions.length}
          onPageChange={goToPage}
        />
      )}
    </div>
  );
};

type TablePaginationProps = {
  page: number;
  totalPages: number;
  rangeStart: number;
  rangeEnd: number;
  totalItems: number;
  onPageChange: (page: number) => void;
};

function TablePagination({
  page,
  totalPages,
  rangeStart,
  rangeEnd,
  totalItems,
  onPageChange,
}: TablePaginationProps) {
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex flex-col-reverse items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-3 sm:flex-row">
      <p className="text-xs text-slate-500">
        Showing{" "}
        <span className="font-medium text-slate-700">{rangeStart}</span>–
        <span className="font-medium text-slate-700">{rangeEnd}</span> of{" "}
        <span className="font-medium text-slate-700">{totalItems}</span>
      </p>

      <div className="flex items-center gap-1">
        <PaginationNavButton
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          ariaLabel="Previous page"
        >
          <ChevronLeft size={14} />
        </PaginationNavButton>

        <div className="hidden items-center gap-1 sm:flex">
          {pageNumbers.map((p, i) =>
            p === "gap" ? (
              <span
                key={`gap-${i}`}
                className="px-1.5 text-xs text-slate-400 select-none"
                aria-hidden
              >
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  "inline-flex size-8 items-center justify-center rounded-md text-xs font-medium transition-colors",
                  p === page
                    ? "bg-blue-600 text-white hover:bg-blue-600"
                    : "text-slate-700 hover:bg-slate-100",
                )}
              >
                {p}
              </button>
            ),
          )}
        </div>

        <span className="px-2 text-xs text-slate-500 sm:hidden">
          Page <span className="font-medium text-slate-700">{page}</span> of{" "}
          <span className="font-medium text-slate-700">{totalPages}</span>
        </span>

        <PaginationNavButton
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          ariaLabel="Next page"
        >
          <ChevronRight size={14} />
        </PaginationNavButton>
      </div>
    </div>
  );
}

function PaginationNavButton({
  children,
  onClick,
  disabled,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className="inline-flex size-8 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-white disabled:hover:text-slate-600"
    >
      {children}
    </button>
  );
}

export default TransactionsTable;
