import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Banknote,
  Calendar,
  CreditCard,
  FileText,
  Landmark,
  Paperclip,
  Pencil,
  RotateCw,
  Smartphone,
  Tag,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatCurrency } from "@/lib/currencies";
import { cn } from "@/lib/utils";
import type { Attachment, Transaction } from "@/types";

import { useTransaction } from "./useTransaction";
import { TRANSACTIONS_QUERY_KEY } from "./useTransactions";
import { useTransactionFormDialog } from "./TransactionFormDialogProvider";

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

function formatFullDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function TransactionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: tx, isLoading, error } = useTransaction(id);
  const { openEdit } = useTransactionFormDialog();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!tx?._id) return;
      await api.delete(`/transactions/${tx._id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: TRANSACTIONS_QUERY_KEY });
      navigate("/app/transactions", { replace: true });
    },
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-sm text-slate-400">Loading transaction…</p>
      </div>
    );
  }

  if (error || !tx) {
    return (
      <div className="p-6">
        <p className="text-sm text-rose-600">
          {error?.message ?? "Transaction not found."}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/app/transactions")}
        >
          Back to transactions
        </Button>
      </div>
    );
  }

  const isIncome = tx.type === "income";
  const PaymentIcon = paymentMethodIcons[tx.paymentMethod];
  const SignIcon = isIncome ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          <span className="max-sm:hidden">Back</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button onClick={() => openEdit(tx)}>
            <Pencil size={14} />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteMutation.isPending}>
                <Trash2 size={14} />
                <span className="max-sm:hidden">Delete</span>
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this transaction?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action can't be undone. The transaction and its
                  attachments will be permanently removed.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteMutation.mutate()}
                  className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Hero card */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium",
                isIncome
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700",
              )}
            >
              <SignIcon size={12} />
              {isIncome ? "Income" : "Expense"}
            </span>
            <p
              className={cn(
                "mt-2 text-3xl font-semibold tabular-nums sm:text-4xl",
                isIncome ? "text-emerald-600" : "text-rose-600",
              )}
            >
              {isIncome ? "+" : "-"}
              {formatCurrency(tx.amount, tx.currency)}
            </p>
            <p className="mt-1 text-lg font-medium text-slate-800">
              {tx.description || "—"}
            </p>
          </div>
        </div>

        {/* Metadata grid */}
        <div className="mt-6 grid gap-x-6 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
          <MetaRow
            icon={Calendar}
            label="Date"
            value={formatFullDate(tx.date)}
          />
          <MetaRow icon={Tag} label="Category" value={tx.category || "—"} />
          <MetaRow
            icon={PaymentIcon}
            label="Payment"
            value={paymentMethodLabel[tx.paymentMethod]}
          />
          <MetaRow
            icon={RotateCw}
            label="Recurring"
            value={tx.isRecurring ? "Yes — repeats monthly" : "No"}
          />
        </div>
      </div>

      {/* Attachments */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Paperclip size={16} className="text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-800">
            Attachments ({tx.attachments?.length ?? 0})
          </h2>
        </div>

        {tx.attachments && tx.attachments.length > 0 ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2  lg:grid-cols-6">
            {tx.attachments.map((a) => (
              <AttachmentCard key={a.key} attachment={a} />
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No attachments.</p>
        )}
      </div>
    </div>
  );
}

function MetaRow({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-md bg-slate-50 text-slate-500">
        <Icon size={14} />
      </span>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-0.5 text-sm capitalize text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function AttachmentCard({ attachment }: { attachment: Attachment }) {
  const isImage = attachment.contentType.startsWith("image/");
  const isPdf = attachment.contentType === "application/pdf";

  return (
    <a
      href={attachment.viewUrl}
      target="_blank"
      rel="noreferrer"
      className="group block overflow-hidden rounded-lg border border-slate-200 bg-slate-50/40 transition-colors hover:border-blue-400"
    >
      <div className="flex aspect-video items-center justify-center bg-slate-100">
        {isImage && attachment.viewUrl ? (
          <img
            src={attachment.viewUrl}
            alt={attachment.filename}
            className="size-full object-cover"
          />
        ) : (
          <FileText size={32} className="text-slate-400" />
        )}
      </div>
      <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-3 py-2">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-slate-700">
            {attachment.filename}
          </p>
          <p className="text-[10px] text-slate-400">
            {(attachment.size / 1024).toFixed(0)} KB
            {isPdf && " · PDF"}
          </p>
        </div>
      </div>
    </a>
  );
}
