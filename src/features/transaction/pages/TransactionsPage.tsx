import { useEffect, useRef, useState } from "react";
import { useDeleteTransaction, useTransactions } from "../hooks/use-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight, Trash2, Calendar, Tag, Filter, ArrowUpDown, Receipt, Loader2, Wallet, ReceiptText, Plus } from "lucide-react";
import type { TransactionType } from "../types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { useCategories } from "@/features/category/hooks/use-category";
import { useNavigate } from "react-router-dom";

const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<TransactionType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [accountFilter, setAccountFilter] = useState<string | "all">("all");
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const accountId = accountFilter || accounts?.[0]?.id || "";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const categories = categoriesData?.data ?? [];

  const handleDeleteClick = (transactionId: string) => {
    setTransactionToDelete(transactionId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (transactionToDelete) {
      deleteTx.mutate(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const params = {
    ...(typeFilter !== "all" && { type: typeFilter }),
    ...(categoryFilter !== "all" && { categoryId: categoryFilter }),
    ...(accountId !== "all" && { accountId: accountFilter })
  };

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useTransactions(params);

  const deleteTx = useDeleteTransaction();
  const loadMoreRef = useRef(null);

  useEffect(() => {
    const current = loadMoreRef.current;
    if (!current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    });

    observer.observe(current);
    return () => observer.unobserve(current);
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const transactions = data?.pages.flatMap((page) => page.data.data) ?? [];

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Transactions
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track all your income and expenses
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden border-border bg-card hover:bg-accent text-foreground"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate("/import-transaction")}
              className="border-border bg-card hover:bg-accent text-foreground"
            >
              <ReceiptText className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Import Message</span>
            </Button>

            <Button
              onClick={() => navigate("/transactions/create")}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
            >
              <Plus className="h-4 w-4 mr-2" />
              <span>Add New</span>
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate('/category')}
              className="sm:hidden border-border bg-card hover:bg-accent text-foreground"
            >
              <Tag className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden sm:flex gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | "all")}>
            <SelectTrigger className="w-36 bg-card border-border text-foreground rounded-xl">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Income</SelectItem>
              <SelectItem value="debit">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as string | "all")}>
            <SelectTrigger className="w-44 bg-card border-border text-foreground rounded-xl">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id} className="capitalize">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={accountFilter || accountId} onValueChange={setAccountFilter}>
            <SelectTrigger className="h-10 min-w-[160px] flex-1 bg-card border-border rounded-xl text-sm shadow-sm hover:border-primary transition-colors">
              <Wallet className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
              <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Accounts</SelectItem>
              {accounts?.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters - Mobile Collapsible */}
        {showFilters && (
          <div className="sm:hidden space-y-3 p-4 bg-card rounded-xl border border-border">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | "all")}>
              <SelectTrigger className="bg-card border-border rounded-xl">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Income</SelectItem>
                <SelectItem value="debit">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as string | "all")}>
              <SelectTrigger className="bg-card border-border rounded-xl">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id} className="capitalize">
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={accountFilter || accountId} onValueChange={setAccountFilter}>
              <SelectTrigger className="h-10 min-w-[160px] flex-1 bg-card border-border rounded-xl text-sm shadow-sm hover:border-primary transition-colors">
                <Wallet className="w-3.5 h-3.5 mr-1.5 text-muted-foreground flex-shrink-0" />
                <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Accounts</SelectItem>
                {accounts?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="border-border bg-card">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Error State */}
        {isError && (
          <Card className="border-border bg-card">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Unable to load transactions</p>
              <p className="text-sm text-muted-foreground">Please ensure your backend is running</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && transactions.length === 0 && (
          <Card className="border-border bg-card">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowLeftRight className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">No transactions yet</h2>
              <p className="text-muted-foreground mb-8">Create your first transaction to start tracking</p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="outline" onClick={() => navigate("/import-transaction")} className="border-border bg-card hover:bg-accent text-foreground rounded-xl">
                  <ReceiptText className="h-4 w-4 mr-2" />
                  Import Message
                </Button>
                <Button
                  onClick={() => navigate("/transactions/create")}
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  <span>Add New Transaction</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transactions List */}
        {!isLoading && !isError && transactions.length > 0 && (
          <div className="space-y-3">
            {/* Summary Bar */}
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-muted-foreground">
                {transactions.length} transactions
              </p>
              <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-foreground">
                <ArrowUpDown className="h-3 w-3 mr-1" />
                Sort
              </Button>
            </div>

            {/* Transaction Cards */}
            {transactions.map((tx, index) => {
              const isLast = index === transactions.length - 1;
              const isIncome = tx.type === "credit";
              const amount = Number(tx.amount) || 0;
              const date = new Date(tx.transactionDate || tx.createdAt);
              const today = new Date();
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);

              let dateDisplay;
              if (date.toDateString() === today.toDateString()) {
                dateDisplay = "Today";
              } else if (date.toDateString() === yesterday.toDateString()) {
                dateDisplay = "Yesterday";
              } else {
                dateDisplay = date.toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
                });
              }

              return (
                <Card
                  key={tx.id}
                  ref={isLast ? loadMoreRef : null}
                  className="border-border bg-card hover:border-primary/30 transition-all duration-200 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl border ${isIncome
                        ? 'bg-primary/10 border-primary/20 text-primary'
                        : 'bg-destructive/10 border-destructive/20 text-destructive'
                        }`}>
                        <ArrowLeftRight className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-foreground truncate pr-2">
                            {tx.description}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${isIncome
                              ? 'bg-primary/10 text-primary'
                              : 'bg-destructive/10 text-destructive'
                              } border-0`}
                          >
                            {tx.category.name}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{dateDisplay}</span>
                          </div>
                          <div className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            <span className="capitalize">{tx.type}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-lg font-bold ${isIncome ? 'text-primary' : 'text-destructive'
                          }`}>
                          {isIncome ? '+' : '-'}{formatINR(amount)}
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(tx.id)}
                          disabled={deleteTx.isPending}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {/* Loading More Indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 text-primary animate-spin" />
              </div>
            )}

            {!hasNextPage && transactions.length > 0 && (
              <p className="text-center text-xs text-muted-foreground py-4">
                You've seen all transactions
              </p>
            )}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md bg-card border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-foreground">
                Delete Transaction
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto border-border bg-card hover:bg-accent text-foreground rounded-xl">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground border-0 rounded-xl"
              >
                {deleteTx.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
