import { useState, useEffect } from "react";
import { useCreateBudget, useUpdateBudget } from "../hooks/use-budget";
import { useCategories } from "@/features/category/hooks/use-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useLocation } from "react-router-dom";
import { Loader2, Target, Calendar, IndianRupee, Tag, ArrowLeft, ChevronDown, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Budget } from "../types";

interface BudgetFormData {
  categoryId: string;
  amount: string;
  startDate: string;
  endDate: string;
}

export default function CreateBudgetPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { initialData?: Budget | null; isEditing?: boolean } | null;
  const initialData = state?.initialData ?? null;
  const isEditing = state?.isEditing ?? false;

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const createBudget = useCreateBudget();
  const updateBudget = useUpdateBudget();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  const [form, setForm] = useState<BudgetFormData>({
    categoryId: "",
    amount: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    if (initialData && isEditing) {
      setForm({
        categoryId: initialData.category?.id || "",
        amount: initialData.amount?.toString() || "",
        startDate: initialData.startDate?.split('T')[0] || "",
        endDate: initialData.endDate?.split('T')[0] || "",
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (field: keyof BudgetFormData, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      categoryId: form.categoryId,
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
            navigate("/budgets");
          },
        }
      );
    } else {
      createBudget.mutate(submitData, {
        onSuccess: () => {
          navigate("/budgets");
        },
      });
    }
  };

  const isPending = createBudget.isPending || updateBudget.isPending;
  const selectedCategory = categories.find((c) => c.id === form.categoryId);

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate("/budgets")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {isEditing ? 'Edit Budget' : 'Create Budget'}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? 'Update your budget details'
                : 'Set a spending limit for a category'}
            </p>
          </div>
        </div>

        <Card className="w-full border-border bg-card shadow-lg overflow-hidden">

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">
          {/* Category Dropdown */}
          <div className="space-y-2 relative">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Category
            </Label>

            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className="w-full h-12 px-4 bg-muted border border-border rounded-xl text-sm focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors flex items-center justify-between"
            >
              {selectedCategory ? (
                <span className="text-foreground">{selectedCategory.name}</span>
              ) : (
                <span className="text-muted-foreground">
                  {categoriesLoading ? "Loading..." : "Select a category"}
                </span>
              )}
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${categoryDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {categoryDropdownOpen && (
              <div className="absolute z-50 mt-1 w-full bg-card border border-border rounded-xl shadow-xl max-h-60 overflow-y-auto">
                {categoriesLoading ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">Loading categories...</div>
                ) : categories.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-muted-foreground">No categories found</div>
                ) : (
                  categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        handleChange("categoryId", category.id);
                        setCategoryDropdownOpen(false);
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between hover:bg-accent transition-colors first:rounded-t-xl last:rounded-b-xl text-left"
                    >
                      <span className="text-sm text-foreground capitalize">{category.name}</span>
                      {form.categoryId === category.id && (
                        <Check className="w-4 h-4 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-muted-foreground" />
              Budget Amount
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">₹</span>
              <Input
                type="number"
                placeholder="5000"
                min="0"
                step="1"
                inputMode="numeric"
                className="pl-8 h-12 text-base bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground placeholder:text-muted-foreground"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                Start Date
              </Label>
              <Input
                type="date"
                className="h-12 text-base bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground"
                value={form.startDate}
                onChange={(e) => handleChange("startDate", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                End Date
              </Label>
              <Input
                type="date"
                className="h-12 text-base bg-muted border-border rounded-xl focus:border-primary focus:ring-primary text-foreground"
                value={form.endDate}
                onChange={(e) => handleChange("endDate", e.target.value)}
                required
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/budgets")}
              className="flex-1 h-12 border-border bg-card hover:bg-accent text-foreground rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.categoryId || !form.amount || !form.startDate || !form.endDate}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-foreground" />
                  {isEditing ? 'Updating...' : 'Creating...'}
                </div>
              ) : (
                isEditing ? 'Update Budget' : 'Create Budget'
              )}
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}
