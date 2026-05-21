import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateCategory, useUpdateCategory } from "../hooks/use-category";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Tag, Loader2 } from "lucide-react";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "../types";

export default function CreateCategoryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { initialData?: Category | null; isEditing?: boolean } | null;
  const initialData = state?.initialData ?? null;
  const isEditing = state?.isEditing ?? false;

  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [form, setForm] = useState<{ name: string; description: string }>({
    name: "",
    description: "",
  });

  useEffect(() => {
    if (initialData && isEditing) {
      setForm({
        name: initialData.name ?? "",
        description: initialData.description ?? "",
      });
    }
  }, [initialData, isEditing]);

  const handleChange = (field: "name" | "description", value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;

    if (isEditing && initialData) {
      const dto: UpdateCategoryDto = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      };
      updateCategory.mutate(
        { id: initialData.id, data: dto },
        {
          onSuccess: () => {
            navigate("/category");
          },
        }
      );
    } else {
      const dto: CreateCategoryDto = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      };
      createCategory.mutate(dto, {
        onSuccess: () => {
          navigate("/category");
        },
      });
    }
  };

  const isPending = createCategory.isPending || updateCategory.isPending;

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => navigate("/category")}
            className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center hover:bg-accent transition-colors shrink-0"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {isEditing ? "Edit Category" : "Create Category"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {isEditing
                ? "Update the category details"
                : "Add a new transaction category"}
            </p>
          </div>
        </div>

        <Card className="w-full border-border bg-card shadow-lg overflow-hidden">

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              placeholder="e.g. Food, Salary, Rent"
              className="h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Description{" "}
              <span className="text-muted-foreground font-normal">(optional)</span>
            </Label>
            <Input
              placeholder="Short description of this category"
              className="h-12 bg-muted border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/category")}
              className="flex-1 h-12 border-border bg-card hover:bg-accent text-foreground rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending || !form.name.trim()}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold"
            >
              {isPending ? (
                <div className="flex items-center justify-center">
                  <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary-foreground" />
                  Saving...
                </div>
              ) : (
                "Save Category"
              )}
            </Button>
          </div>
        </form>
      </Card>
      </div>
    </div>
  );
}
