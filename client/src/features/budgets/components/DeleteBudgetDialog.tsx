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
import type { Budget } from "@/types";

type BudgetDeleteDialogProps = {
  budgetToDelete: Budget | null;
  setBudgetToDelete: React.Dispatch<React.SetStateAction<Budget | null>>;
  onDelete: (budget: Budget) => void;
};

export function DeleteDialog({
  budgetToDelete,
  setBudgetToDelete,
  onDelete,
}: BudgetDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!budgetToDelete}
      onOpenChange={(open) => !open && setBudgetToDelete(null)}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete this
            budget.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => budgetToDelete && onDelete(budgetToDelete)}
            className="bg-rose-600 text-white hover:bg-rose-700 focus-visible:ring-rose-500/40"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
