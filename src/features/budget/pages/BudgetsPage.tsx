import { useBudgets, useDeleteBudget, useBudgetProgress } from "../hooks/use-budget";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, IndianRupee, Target, Loader2, Edit2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import type { Budget } from "../types";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "bg-destructive";
  if (percentage >= 80) return "bg-orange-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-primary";
};

const getStatusBadge = (percentage: number) => {
  if (percentage >= 100) return "bg-destructive/10 text-destructive border-destructive/20";
  if (percentage >= 80) return "bg-orange-500/10 text-orange-500 border-orange-500/20";
  if (percentage >= 50) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-primary/10 text-primary border-primary/20";
};

export default function BudgetsPage() {
  const navigate = useNavigate();
  const { data, isLoading, isError } = useBudgets();
  const deleteBudget = useDeleteBudget();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (budget: Budget) => {
    navigate("/budgets/create", { state: { initialData: budget, isEditing: true } });
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget.mutate(budgetToDelete);
      setDeleteDialogOpen(false);
    }
  };

  const budgets = data?.data || [];

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Budgets
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track spending limits by category
            </p>
          </div>

          <Button
            onClick={() => navigate("/budgets/create")}
            className="group relative bg-primary hover:bg-primary/95 text-primary-foreground border-0 shadow-lg rounded-xl transition-all duration-200"
          >
            <Target className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Create Budget</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin" />
              <Target className="w-6 h-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-muted-foreground mt-4">Loading your budgets...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-border bg-card">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Failed to load budgets</p>
              <p className="text-sm text-muted-foreground mb-6">Please try again later</p>
              <Button onClick={() => window.location.reload()} className="bg-primary text-primary-foreground rounded-xl">
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && budgets.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">No budgets created</h2>
              <p className="text-muted-foreground mb-8">
                Create your first budget to control spending
              </p>
              <Button
                onClick={() => navigate("/budgets/create")}
                className="bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl"
              >
                Create Budget
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Budget Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onDelete={handleDeleteClick}
              onEdit={handleEditClick}
            />
          ))}
        </div>

        {/* Delete Modal */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden bg-card border-border">
            <div className="bg-destructive/10 p-6 flex justify-center border-b border-border">
              <div className="w-16 h-16 bg-destructive/20 rounded-2xl flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-destructive" />
              </div>
            </div>

            <div className="p-6">
              <AlertDialogHeader className="space-y-3">
                <AlertDialogTitle className="text-xl font-semibold text-foreground text-center">
                  Delete Budget
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground text-center text-sm">
                  Are you sure you want to delete this budget?
                  <span className="block mt-2 font-medium text-destructive">
                    This action cannot be undone.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter className="flex flex-col gap-2 mt-6">
                <AlertDialogCancel className="w-full h-12 border-border bg-card hover:bg-accent text-foreground rounded-xl text-base">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="w-full h-12 bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 rounded-xl text-base font-medium"
                >
                  {deleteBudget.isPending ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Deleting...
                    </div>
                  ) : (
                    "Yes, Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

interface BudgetCardProps {
  budget: Budget;
  onDelete: (id: string) => void;
  onEdit: (budget: Budget) => void;
}

function BudgetCard({ budget, onDelete, onEdit }: BudgetCardProps) {
  const { data, isLoading } = useBudgetProgress(budget.id);

  const progress = data?.data?.progressPercentage ?? 0;
  const spent = data?.data?.totalSpent ?? 0;
  const remaining = data?.data?.remainingLimit ?? 0;
  const isOverBudget = progress > 100;

  return (
    <Card className="group relative border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
      <div className={`absolute top-0 left-0 right-0 h-1 ${getProgressColor(progress)}`} />

      <CardContent className="p-5 space-y-4">
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-foreground capitalize">
              {budget.category.name}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full border ${getStatusBadge(progress)}`}>
                {isOverBudget ? 'Overspent' : progress >= 80 ? 'Near Limit' : 'On Track'}
              </span>
              <span className="text-muted-foreground">
                {new Date(budget.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} -
                {new Date(budget.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onEdit(budget)}
              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(budget.id)}
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Budget Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-muted-foreground">
            <IndianRupee className="w-4 h-4 mr-1 text-muted-foreground" />
            Budget: <span className="font-medium text-foreground ml-1">{formatINR(Number(budget.amount))}</span>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className={`font-medium ${isOverBudget ? 'text-destructive' : progress >= 80 ? 'text-orange-500' : 'text-primary'}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2.5 bg-muted rounded-full overflow-hidden border border-border">
            <div
              className={`absolute top-0 left-0 h-full ${getProgressColor(progress)} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            {isOverBudget && (
              <div
                className="absolute top-0 h-full bg-destructive opacity-30"
                style={{ width: `${progress - 100}%`, left: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-destructive/10 rounded-lg p-3 border border-destructive/20">
            <p className="text-xs text-destructive mb-1 font-medium">Spent</p>
            <p className="text-base font-bold text-destructive">
              {formatINR(spent)}
            </p>
          </div>
          <div className={`rounded-lg p-3 border ${remaining >= 0
              ? 'bg-primary/10 border-primary/20'
              : 'bg-destructive/10 border-destructive/20'
            }`}>
            <p className={`text-xs ${remaining >= 0
                ? 'text-primary'
                : 'text-destructive'
              } mb-1 font-medium`}>
              Remaining
            </p>
            <p className={`text-base font-bold ${remaining >= 0
                ? 'text-primary'
                : 'text-destructive'
              }`}>
              {remaining >= 0 ? formatINR(remaining) : `-${formatINR(Math.abs(remaining))}`}
            </p>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </CardContent>
    </Card>
  );
}
