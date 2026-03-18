import { useState } from "react";
import { useCategories, useCreateCategory, useUpdateCategory, useDeactivateCategory } from "./hooks/use-category";
import type { Category, CreateCategoryDto, UpdateCategoryDto } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
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
import {
    Plus,
    Pencil,
    Tag,
    Loader2,
    Search,
    ToggleLeft,
    FolderOpen,
} from "lucide-react";

// ─── Category Form Modal ───────────────────────────────────────────────────

interface CategoryFormModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    initialData?: Category;
    isEditing?: boolean;
}

function CategoryFormModal({
    open,
    onOpenChange,
    initialData,
    isEditing = false,
}: CategoryFormModalProps) {
    const createCategory = useCreateCategory();
    const updateCategory = useUpdateCategory();

    const [form, setForm] = useState<{ name: string; description: string }>({
        name: initialData?.name ?? "",
        description: initialData?.description ?? "",
    });

    // Sync form when initialData changes (edit mode)
    useState(() => {
        if (initialData) {
            setForm({
                name: initialData.name ?? "",
                description: initialData.description ?? "",
            });
        }
    });

    const handleChange = (field: "name" | "description", value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = () => {
        if (!form.name.trim()) return;

        if (isEditing && initialData) {
            const dto: UpdateCategoryDto = {
                name: form.name.trim(),
                description: form.description.trim() || null,
            };
            updateCategory.mutate(
                { id: initialData.id, data: dto },
                { onSuccess: () => { onOpenChange(false); } }
            );
        } else {
            const dto: CreateCategoryDto = {
                name: form.name.trim(),
                description: form.description.trim() || null,
            };
            createCategory.mutate(dto, {
                onSuccess: () => {
                    onOpenChange(false);
                    setForm({ name: "", description: "" });
                },
            });
        }
    };

    const isPending = createCategory.isPending || updateCategory.isPending;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="px-6 pt-6 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <DialogHeader className="p-0">
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                            {isEditing ? "Edit Category" : "Create Category"}
                        </DialogTitle>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isEditing
                                ? "Update the category details"
                                : "Add a new transaction category"}
                        </p>
                    </DialogHeader>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-gray-400" />
                            Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            placeholder="e.g. Food, Salary, Rent"
                            className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={form.name}
                            onChange={(e) => handleChange("name", e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description{" "}
                            <span className="text-gray-400 font-normal">(optional)</span>
                        </Label>
                        <Input
                            placeholder="Short description of this category"
                            className="h-11 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={form.description}
                            onChange={(e) => handleChange("description", e.target.value)}
                        />
                    </div>
                </div>

                {/* Footer */}
                <DialogFooter className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        className="border-gray-200 dark:border-gray-800"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={isPending || !form.name.trim()}
                        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-600/25"
                    >
                        {isPending ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        {isEditing ? "Update" : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// ─── Category Card ─────────────────────────────────────────────────────────

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDeactivate: (id: string) => void;
    isDeactivating: boolean;
}

function CategoryCard({ category, onEdit, onDeactivate, isDeactivating }: CategoryCardProps) {
    return (
        <Card className="border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center flex-shrink-0">
                        <Tag className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-medium text-gray-900 dark:text-white capitalize truncate">
                                {category.name}
                            </h3>
                            <Badge
                                variant="secondary"
                                className={
                                    category.isActive
                                        ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border-0 text-xs"
                                        : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 border-0 text-xs"
                                }
                            >
                                {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        {category.description ? (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {category.description}
                            </p>
                        ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-600 italic">
                                No description
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(category)}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeactivate(category.id)}
                            disabled={isDeactivating || !category.isActive}
                            className="h-8 w-8 p-0 text-gray-400 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30 disabled:opacity-40"
                        >
                            {isDeactivating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <ToggleLeft className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function CategoryPage() {
    const { data: categoriesData, isLoading, isError } = useCategories();
    const deactivate = useDeactivateCategory();

    const categories = categoriesData?.data ?? [];

    const [search, setSearch] = useState("");
    const [createOpen, setCreateOpen] = useState(false);
    const [editTarget, setEditTarget] = useState<Category | null>(null);
    const [deactivateTarget, setDeactivateTarget] = useState<string | null>(null);

    const filtered = categories.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        (c.description ?? "").toLowerCase().includes(search.toLowerCase())
    );

    const activeCount = categories.filter((c) => c.isActive).length;
    const inactiveCount = categories.length - activeCount;

    const handleConfirmDeactivate = () => {
        if (!deactivateTarget) return;
        deactivate.mutate(deactivateTarget, {
            onSuccess: () => setDeactivateTarget(null),
            onError: () => setDeactivateTarget(null),
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Manage your transaction categories
                        </p>
                    </div>
                    <Button
                        onClick={() => setCreateOpen(true)}
                        className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white border-0 shadow-lg shadow-blue-600/25"
                    >
                        <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                        <span className="hidden sm:inline">New Category</span>
                        <span className="sm:hidden">New</span>
                    </Button>
                </div>

                {/* Stats */}
                {!isLoading && categories.length > 0 && (
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: "Total", value: categories.length, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30" },
                            { label: "Active", value: activeCount, color: "text-green-600 dark:text-green-400", bg: "bg-green-50 dark:bg-green-950/30" },
                            { label: "Inactive", value: inactiveCount, color: "text-gray-500 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800" },
                        ].map((stat) => (
                            <Card key={stat.label} className="border-gray-200 dark:border-gray-800">
                                <CardContent className="p-4 text-center">
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Search */}
                {categories.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-10 h-11 bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i} className="border-gray-200 dark:border-gray-800">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse" />
                                        <div className="flex-1 space-y-2">
                                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                            <div className="h-3 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <Card className="border-gray-200 dark:border-gray-800">
                        <CardContent className="py-16 text-center">
                            <p className="text-gray-500 dark:text-gray-400">Failed to load categories</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty */}
                {!isLoading && !isError && categories.length === 0 && (
                    <Card className="border-gray-200 dark:border-gray-800">
                        <CardContent className="py-20 text-center">
                            <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FolderOpen className="h-10 w-10 text-blue-600" />
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                No categories yet
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Create your first category to organize transactions
                            </p>
                            <Button
                                onClick={() => setCreateOpen(true)}
                                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-0"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Category
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* No search results */}
                {!isLoading && !isError && categories.length > 0 && filtered.length === 0 && (
                    <Card className="border-gray-200 dark:border-gray-800">
                        <CardContent className="py-12 text-center">
                            <p className="text-gray-500 dark:text-gray-400">
                                No categories match "<span className="font-medium">{search}</span>"
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Category List */}
                {!isLoading && !isError && filtered.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-gray-500 dark:text-gray-400 px-1">
                            {filtered.length} {filtered.length === 1 ? "category" : "categories"}
                            {search ? ` matching "${search}"` : ""}
                        </p>
                        {filtered.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onEdit={(c) => setEditTarget(c)}
                                onDeactivate={(id) => setDeactivateTarget(id)}
                                isDeactivating={deactivate.isPending && deactivateTarget === category.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <CategoryFormModal
                open={createOpen}
                onOpenChange={setCreateOpen}
            />

            {/* Edit Modal */}
            {editTarget && (
                <CategoryFormModal
                    open={!!editTarget}
                    onOpenChange={(open) => { if (!open) setEditTarget(null); }}
                    initialData={editTarget}
                    isEditing
                />
            )}

            {/* Deactivate Confirmation */}
            <AlertDialog
                open={!!deactivateTarget}
                onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
            >
                <AlertDialogContent className="sm:max-w-md bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                            Deactivate Category
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                            This category will be hidden from transaction and budget forms. Existing data won't be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200 dark:border-gray-800">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeactivate}
                            className="bg-orange-600 hover:bg-orange-700 text-white border-0"
                        >
                            {deactivate.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : null}
                            Deactivate
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}