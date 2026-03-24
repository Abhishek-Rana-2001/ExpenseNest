import { useCallback, useEffect, useState } from "react";
import { api, normalizeError } from "../../lib/api";
import {
  TransactionForm,
  type TransactionFormMode,
} from "./components/TransactionForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Bell, LogOut, Pencil, Plus, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/ui/SearchBar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Transaction = {
  _id: string;
  amount: number;
  currency: string;
  type: "income" | "expense";
  description?: string;
  category?: string;
  date: string;
  createdAt: string;
};

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<TransactionFormMode>("add");
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      setLoadError(null);
      const res = await api.get<{ ok: boolean; data: Transaction[] }>(
        "/transactions",
      );
      setTransactions(res.data?.data ?? []);
    } catch (error) {
      const normalizedError = normalizeError(error);
      setLoadError(normalizedError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  function openAddForm() {
    setFormMode("add");
    setSelectedTransaction(null);
    setShowForm(true);
  }

  function openEditForm(transaction: Transaction) {
    setFormMode("edit");
    setSelectedTransaction(transaction);
    setShowForm(true);
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between bg-white p-4 rounded-lg">
        <SearchBar
          placeholder="Search transactions, merchants, or tags..."
          value={search}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setSearch(e.target.value)
          }
        />

        <div className="flex items-center gap-2">
          <Button
            className="rounded-full group cursor-pointer p-2 group"
            variant={"ghost"}
          ><Bell className='lg:size-6 md:size-5 group-hover:animate-vibrate duration-300 transition-all ' /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button
                variant={"ghost"}
                className="rounded-full group cursor-pointer p-1"
              >
                <Settings
                  className="lg:size-6 md:size-5 group-hover:rotate-180 duration-300 transition-all"
                />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuItem>
                  <User />
                  Profile
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuItem className="focus:bg-red-500 data-highlighted:bg-red-500 data-highlighted:text-white focus:text-white">
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>


          <DropdownMenu>
            <DropdownMenuTrigger>
               <Button
            className="rounded-full group cursor-pointer overflow-hidden p-2"
            variant={"ghost"}
          >
            <img src="/src/assets/Avatar-image.svg" className="lg:size-6 md:size-5 object-cover rounded-full" alt="" />
          </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent>
              <DropdownMenuGroup>
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuItem className="focus:bg-red-500 data-highlighted:bg-red-500 data-highlighted:text-white focus:text-white">
                <LogOut />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
         
        </div>
      </header>

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight select-none">
          Transactions
        </h1>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <div className="flex justify-end">
            <DialogTrigger asChild>
              <Button type="button" onClick={openAddForm}>
                <Plus />
                Add transaction
              </Button>
            </DialogTrigger>
          </div>
          <DialogContent className="bg-background">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {formMode === "add" ? "Add Transaction" : "Edit Transaction"}
              </DialogTitle>
            </DialogHeader>
            <TransactionForm
              mode={formMode}
              transaction={selectedTransaction}
              onSuccess={async () => {
                await fetchTransactions();
                setShowForm(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-xl border border-border bg-card/60 p-6">
        <h2 className="mb-4 text-sm font-semibold tracking-tight">
          Recent transactions
        </h2>

        {loadError && (
          <p className="mb-4 text-sm text-destructive">{loadError}</p>
        )}

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No transactions yet.</p>
        ) : (
          <ul className="space-y-2">
            {transactions.map((tx) => (
              <li
                key={tx._id}
                className="flex items-center justify-between rounded-md border border-border bg-background/80 px-4 py-3"
              >
                <div>
                  <span
                    className={
                      tx.type === "income" ? "text-emerald-400" : "text-red-400"
                    }
                  >
                    {tx.type === "income" ? "+" : "-"}
                    {tx.amount.toFixed(2)} {tx.currency}
                  </span>
                  {tx.description && (
                    <span className="ml-2 text-sm text-muted-foreground">
                      {tx.description}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {tx.category ?? "—"}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => openEditForm(tx)}
                >
                  <Pencil />
                  Edit
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
