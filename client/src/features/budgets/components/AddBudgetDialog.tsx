import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Budget } from "@/types";
import { Plus } from "lucide-react";
import { BudgetForm } from "./BudgetForm";


function AddBudgetDialog({
  showForm,
  setShowForm,
  openAddForm,
  formMode,
  selectedBudget,
}: {
  showForm: boolean;
  setShowForm: React.Dispatch<React.SetStateAction<boolean>>;
  openAddForm: () => void;
  formMode: "add" | "edit";
  selectedBudget?: Budget | null;
}) {
  return (
    <Dialog open={showForm} onOpenChange={setShowForm}>
      <DialogTrigger asChild>
        <Button type="button" onClick={openAddForm}>
          <Plus />
          <span className="max-sm:hidden">Add budget</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-white border-slate-200">
        <DialogHeader>
          <DialogTitle>
            {formMode === "add" ? "Add Budget" : "Edit Budget"}
          </DialogTitle>
          <DialogDescription>
            {formMode === "add"
              ? "Set a monthly spending limit for a category."
              : "Update or remove this category budget."}
          </DialogDescription>
        </DialogHeader>
        <BudgetForm
          mode={formMode}
          budget={selectedBudget}
          onSuccess={() => setShowForm(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

export default AddBudgetDialog
