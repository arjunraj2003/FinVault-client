import { useState, useEffect } from "react";
import { useCreateBudget, useUpdateBudget } from "../hooks/use-budget";
import { useCategories } from "@/features/category/hooks/use-category";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Target, Calendar, IndianRupee, Tag, X, ChevronDown, Check } from "lucide-react";

interface BudgetFormData {
  category: string;
  amount: string;
  startDate: string;
  endDate: string;
}

interface CreateBudgetModalProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialData?: any;
  isEditing?: boolean;
}

export function CreateBudgetModal({
  open: controlledOpen,
  onOpenChange,
  initialData,
  isEditing = false
}: CreateBudgetModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;

  const setIsOpen = (value: boolean) => {
    if (onOpenChange) {
      onOpenChange(value);
    } else {
      setInternalOpen(value);
    }
    if (!value) {
      resetForm();
      setCategoryDropdownOpen(false);
    }
  };

  const [form, setForm] = useState<BudgetFormData>({
    category: "",
    amount: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (initialData && isEditing) {
      setForm({
        category: initialData.category || "",
        amount: initialData.amount?.toString() || "",
        startDate: initialData.startDate?.split('T')[0] || "",
        endDate: initialData.endDate?.split('T')[0] || "",
      });
    }
  }, [initialData, isEditing]);

  const resetForm = () => {
    setForm({
      category: "",
      amount: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleChange = (field: keyof BudgetFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    const submitData = {
      category: form.category,
      amount: form.amount,
      startDate: form.startDate,
      endDate: form.endDate,
    };

    if (isEditing && initialData?.id) {
      updateBudget.mutate(
        {
          budgetId: initialData.id,
          data: submitData,
        },
        {
          onSuccess: () => {
            setIsOpen(false);
            resetForm();
          },
        }
      );
    } else {
      createBudget.mutate(submitData, {
        onSuccess: () => {
          setIsOpen(false);
          resetForm();
        },
      });
    }
  };

  const isPending = createBudget.isPending || updateBudget.isPending;

  // Get selected category details
  const selectedCategory = categories.find((c) => c.id === form.category);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!controlledOpen && !isEditing && (
        <DialogTrigger asChild>
          <Button className="group relative bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 transition-all duration-200">
            <Target className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Create Budget</span>
            <span className="sm:hidden">New</span>
          </Button>
        </DialogTrigger>
      )}

      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800 w-[95vw] sm:w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 z-10 bg-white dark:bg-[#0F1A2F] px-4 sm:px-6 pt-4 sm:pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setIsOpen(false)}
            className="absolute right-4 sm:right-6 top-4 sm:top-6 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>

          <DialogHeader className="p-0">
            <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">
              {isEditing ? 'Edit Budget' : 'Create Budget'}
            </DialogTitle>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isEditing
                ? 'Update your budget details'
                : 'Set a spending limit for a category'}
            </p>
          </DialogHeader>
        </div>

        <div className="px-4 sm:px-6 py-4 space-y-5">
          {/* Category - Custom Mobile Friendly Dropdown */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              Category
            </Label>

            {/* Custom dropdown trigger - mobile optimized */}
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full h-12 px-4 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-colors flex items-center justify-between"
            >
              {selectedCategory ? (
                <span className="text-gray-900 dark:text-white">{selectedCategory.name}</span>
              ) : (
                <span className="text-gray-400">
                  {categoriesLoading ? "Loading..." : "Select a category"}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Custom dropdown options - full width on mobile */}
            {categoryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-[calc(100%-2rem)] sm:w-auto bg-white dark:bg-[#0F1A2F] border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {categoriesLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-400">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400">No categories found</div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        handleChange("category", category.id);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">{category.name}</span>
                      {form.category === category.id && (
                        <Check className="w-4 h-4 text-blue-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-gray-400" />
              Budget Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
              <Input
                type="number"
                placeholder="5000"
                min="0"
                step="1"
                inputMode="numeric"
                className="pl-8 h-12 text-base bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date Range - Stack on mobile, grid on larger */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Start Date
              </Label>
              <Input
                type="date"
                className="h-12 text-base bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                End Date
              </Label>
              <Input
                type="date"
                className="h-12 text-base bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                required
              />
            </div>
          </div>
        </div>

        <DialogFooter className="sticky bottom-0 bg-white dark:bg-[#0F1A2F] px-4 sm:px-6 py-4 border-t border-gray-100 dark:border-gray-800">
          <Button
            onClick={handleSubmit}
            disabled={isPending || !form.category || !form.amount || !form.startDate || !form.endDate}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl text-base font-medium shadow-lg shadow-blue-600/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                {isEditing ? 'Updating...' : 'Creating...'}
              </div>
            ) : (
              isEditing ? 'Update Budget' : 'Create Budget'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}