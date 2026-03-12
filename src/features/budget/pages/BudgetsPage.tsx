import { useBudgets, useDeleteBudget, useBudgetProgress, useUpdateBudget } from "../hooks/use-budget";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, IndianRupee, Target, Loader2, Edit2, AlertCircle } from "lucide-react";
import { useState } from "react";
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
import { CreateBudgetModal } from "../components/CreateBudgetModal";

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

// Get progress color based on percentage
const getProgressColor = (percentage: number) => {
  if (percentage >= 100) return "bg-red-600";
  if (percentage >= 80) return "bg-orange-500";
  if (percentage >= 50) return "bg-yellow-500";
  return "bg-green-500";
};

// Get status badge color
const getStatusBadge = (percentage: number) => {
  if (percentage >= 100) return "bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400 border-red-200 dark:border-red-900";
  if (percentage >= 80) return "bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-200 dark:border-orange-900";
  if (percentage >= 50) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-900";
  return "bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-green-200 dark:border-green-900";
};

export default function BudgetsPage() {
  const { data, isLoading, isError } = useBudgets();
  const deleteBudget = useDeleteBudget();
  const updateBudget = useUpdateBudget();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);
  const [editingBudget, setEditingBudget] = useState<any>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setBudgetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleEditClick = (budget: any) => {
    setEditingBudget(budget);
    setEditModalOpen(true);
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      deleteBudget.mutate(budgetToDelete);
      setDeleteDialogOpen(false);
    }
  };

  const budgets = data?.data || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Budgets
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track spending limits by category
            </p>
          </div>

          <CreateBudgetModal />
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-blue-600 rounded-full animate-spin" />
              <Target className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-sm text-gray-500 mt-4">Loading your budgets...</p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Failed to load budgets</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please try again later</p>
              <Button onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Empty */}
        {!isLoading && budgets.length === 0 && (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Target className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No budgets created</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">
                Create your first budget to control spending
              </p>
              <CreateBudgetModal />
            </CardContent>
          </Card>
        )}

        {/* Budget Cards */}
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget: any) => (
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
          <AlertDialogContent className="sm:max-w-md p-0 overflow-hidden">
            {/* Icon Header */}
            <div className="bg-red-50 dark:bg-red-950/30 p-6 flex justify-center">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center">
                <Trash2 className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6">
              <AlertDialogHeader className="space-y-3">
                <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white text-center">
                  Delete Budget
                </AlertDialogTitle>
                <AlertDialogDescription className="text-gray-500 dark:text-gray-400 text-center text-sm">
                  Are you sure you want to delete this budget? 
                  <span className="block mt-2 font-medium text-red-600 dark:text-red-400">
                    This action cannot be undone.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              
              <AlertDialogFooter className="flex flex-col gap-2 mt-6">
                <AlertDialogCancel className="w-full h-12 border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-xl text-base">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="w-full h-12 bg-red-600 hover:bg-red-700 text-white border-0 rounded-xl text-base font-medium"
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

        {/* Edit Modal */}
        <CreateBudgetModal
          open={editModalOpen}
          onOpenChange={setEditModalOpen}
          initialData={editingBudget}
          isEditing={true}
        />
      </div>
    </div>
  );
}

function BudgetCard({ budget, onDelete, onEdit }: any) {
  const { data, isLoading } = useBudgetProgress(budget.id);

  const progress = data?.data?.progressPercentage ?? 0;
  const spent = data?.data?.totalSpent ?? 0;
  const remaining = data?.data?.remainingLimit ?? 0;
  const isOverBudget = progress > 100;

  return (
    <Card className="group relative border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 overflow-hidden">
      {/* Status Indicator Line */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getProgressColor(progress)}`} />
      
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
              {budget.category}
            </h3>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-0.5 rounded-full border ${getStatusBadge(progress)}`}>
                {isOverBudget ? 'Overspent' : progress >= 80 ? 'Near Limit' : 'On Track'}
              </span>
              <span className="text-gray-400">
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
              className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => onDelete(budget.id)}
              className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Budget Amount */}
        <div className="flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
            <IndianRupee className="w-4 h-4 mr-1" />
            Budget: <span className="font-medium text-gray-900 dark:text-white ml-1">{formatINR(Number(budget.amount))}</span>
          </div>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className={`font-medium ${isOverBudget ? 'text-red-600' : progress >= 80 ? 'text-orange-600' : 'text-green-600'}`}>
              {progress.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`absolute top-0 left-0 h-full ${getProgressColor(progress)} transition-all duration-500 ease-out`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
            {isOverBudget && (
              <div
                className="absolute top-0 h-full bg-red-600 opacity-30"
                style={{ width: `${progress - 100}%`, left: '100%' }}
              />
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="bg-red-50 dark:bg-red-950/30 rounded-lg p-3">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Spent</p>
            <p className="text-base font-bold text-red-700 dark:text-red-300">
              {formatINR(spent)}
            </p>
          </div>
          <div className={`rounded-lg p-3 ${
            remaining >= 0 
              ? 'bg-green-50 dark:bg-green-950/30' 
              : 'bg-red-50 dark:bg-red-950/30'
          }`}>
            <p className={`text-xs ${
              remaining >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            } mb-1`}>
              Remaining
            </p>
            <p className={`text-base font-bold ${
              remaining >= 0 
                ? 'text-green-700 dark:text-green-300' 
                : 'text-red-700 dark:text-red-300'
            }`}>
              {remaining >= 0 ? formatINR(remaining) : `-${formatINR(Math.abs(remaining))}`}
            </p>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </CardContent>
    </Card>
  );
}