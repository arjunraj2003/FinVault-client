import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCategories, useDeactivateCategory } from "./hooks/use-category";
import type { Category } from "./types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
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

// ─── Category Card ─────────────────────────────────────────────────────────

interface CategoryCardProps {
    category: Category;
    onEdit: (category: Category) => void;
    onDeactivate: (id: string) => void;
    isDeactivating: boolean;
}

function CategoryCard({ category, onEdit, onDeactivate, isDeactivating }: CategoryCardProps) {
    return (
        <Card className="border-border bg-card hover:border-primary/30 transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 border border-primary/20">
                        <Tag className="w-5 h-5 text-primary" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-medium text-foreground capitalize truncate">
                                {category.name}
                            </h3>
                            <Badge
                                variant="secondary"
                                className={
                                    category.isActive
                                        ? "bg-primary/10 text-primary border-0 text-xs"
                                        : "bg-muted text-muted-foreground border-0 text-xs"
                                }
                            >
                                {category.isActive ? "Active" : "Inactive"}
                            </Badge>
                        </div>
                        {category.description ? (
                            <p className="text-xs text-muted-foreground truncate">
                                {category.description}
                            </p>
                        ) : (
                            <p className="text-xs text-muted-foreground/60 italic">
                                No description
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEdit(category)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDeactivate(category.id)}
                            disabled={isDeactivating || !category.isActive}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-orange-500 hover:bg-orange-500/10 transition-colors disabled:opacity-40"
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
    const navigate = useNavigate();
    const { data: categoriesData, isLoading, isError } = useCategories();
    const deactivate = useDeactivateCategory();

    const categories = categoriesData?.data ?? [];

    const [search, setSearch] = useState("");
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

    const handleEdit = (category: Category) => {
        navigate("/category/create", { state: { initialData: category, isEditing: true } });
    };

    return (
        <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
                            Categories
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            Manage your transaction categories
                        </p>
                    </div>
                    <Button
                        onClick={() => navigate("/category/create")}
                        className="group bg-primary hover:bg-primary/95 text-primary-foreground border-0 shadow-lg rounded-xl"
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
                            { label: "Total", value: categories.length, color: "text-primary", bg: "bg-primary/10 border-primary/20" },
                            { label: "Active", value: activeCount, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
                            { label: "Inactive", value: inactiveCount, color: "text-muted-foreground", bg: "bg-muted border-border" },
                        ].map((stat) => (
                            <Card key={stat.label} className="border-border bg-card">
                                <CardContent className="p-4 text-center">
                                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Search */}
                {categories.length > 0 && (
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search categories..."
                            className="pl-10 h-11 bg-card border-border rounded-xl focus:border-primary focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                )}

                {/* Loading */}
                {isLoading && (
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                          <Card key={i} className="border-border bg-card">
                              <CardContent className="p-4">
                                  <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-xl bg-muted animate-pulse" />
                                      <div className="flex-1 space-y-2">
                                          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                                          <div className="h-3 w-48 bg-muted rounded animate-pulse" />
                                      </div>
                                  </div>
                              </CardContent>
                          </Card>
                        ))}
                    </div>
                )}

                {/* Error */}
                {isError && (
                    <Card className="border-border bg-card">
                        <CardContent className="py-16 text-center">
                            <p className="text-muted-foreground">Failed to load categories</p>
                        </CardContent>
                    </Card>
                )}

                {/* Empty */}
                {!isLoading && !isError && categories.length === 0 && (
                    <Card className="border-border bg-card">
                        <CardContent className="py-20 text-center">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <FolderOpen className="h-10 w-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                No categories yet
                            </h2>
                            <p className="text-muted-foreground mb-6">
                                Create your first category to organize transactions
                            </p>
                            <Button
                                onClick={() => navigate("/category/create")}
                                className="bg-primary hover:bg-primary/95 text-primary-foreground border-0 rounded-xl"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Create Category
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* No search results */}
                {!isLoading && !isError && categories.length > 0 && filtered.length === 0 && (
                    <Card className="border-border bg-card">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                No categories match "<span className="font-medium text-foreground">{search}</span>"
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Category List */}
                {!isLoading && !isError && filtered.length > 0 && (
                    <div className="space-y-3">
                        <p className="text-sm text-muted-foreground px-1">
                            {filtered.length} {filtered.length === 1 ? "category" : "categories"}
                            {search ? ` matching "${search}"` : ""}
                        </p>
                        {filtered.map((category) => (
                            <CategoryCard
                                key={category.id}
                                category={category}
                                onEdit={handleEdit}
                                onDeactivate={(id) => setDeactivateTarget(id)}
                                isDeactivating={deactivate.isPending && deactivateTarget === category.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Deactivate Confirmation */}
            <AlertDialog
                open={!!deactivateTarget}
                onOpenChange={(open) => { if (!open) setDeactivateTarget(null); }}
            >
                <AlertDialogContent className="sm:max-w-md bg-card border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl font-semibold text-foreground">
                            Deactivate Category
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            This category will be hidden from transaction and budget forms. Existing data won't be affected.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-border bg-card hover:bg-accent text-foreground rounded-xl">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDeactivate}
                            className="bg-orange-600 hover:bg-orange-700 text-white border-0 rounded-xl"
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