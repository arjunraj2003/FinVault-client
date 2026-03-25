import { useEffect, useRef, useState } from "react";
import { useDeleteTransaction, useTransactions } from "../hooks/use-transactions";
import { CreateTransactionModal } from "../components/CreateTransactionModal";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeftRight, ChevronLeft, ChevronRight, Trash2, Calendar, Tag, IndianRupee, Filter, ArrowUpDown, Receipt, Loader2, Wallet } from "lucide-react";
import type { TransactionType } from "../types";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { useCategories } from "@/features/category/hooks/use-category";
import { useNavigate } from "react-router-dom";


// Format currency to Indian Rupees
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
  const navigate = useNavigate()

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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Transactions
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Track all your income and expenses
            </p>
          </div>

          <div className="flex gap-2">
            {/* Filter Toggle Button - Mobile */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <CreateTransactionModal />

            <Button
              variant="outline"
              onClick={() => navigate('/category')}
              className="sm:hidden"
            >
              <Tag className="h-4 w-4 mr-2" />
            </Button>
          </div>
        </div>

        {/* Filters - Desktop */}
        <div className="hidden sm:flex gap-3">
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | "all")}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="credit">Income</SelectItem>
              <SelectItem value="debit">Expense</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as string | "all")}>
            <SelectTrigger className="w-44">
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
            <SelectTrigger className="h-10 min-w-[160px] flex-1 bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800 rounded-xl text-sm shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
              <Wallet className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
              <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
            </SelectTrigger>
            <SelectContent>
              {accounts?.map((a) => (
                <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Filters - Mobile Collapsible */}
        {showFilters && (
          <div className="sm:hidden space-y-3 p-4 bg-white dark:bg-[#0F1A2F] rounded-xl border border-gray-200 dark:border-gray-800">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as TransactionType | "all")}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="credit">Income</SelectItem>
                <SelectItem value="debit">Expense</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as string | "all")}>
              <SelectTrigger>
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
              <SelectTrigger className="h-10 min-w-[160px] flex-1 bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800 rounded-xl text-sm shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <Wallet className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
              </SelectTrigger>
              <SelectContent>
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
              <Card key={i} className="border-gray-200 dark:border-gray-800">
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
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to load transactions</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Please ensure your backend is running</p>
            </CardContent>
          </Card>
        )}

        {/* Empty State */}
        {!isLoading && !isError && transactions.length === 0 && (
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <ArrowLeftRight className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No transactions yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Create your first transaction to start tracking</p>
              <CreateTransactionModal />
            </CardContent>
          </Card>
        )}

        {/* Transactions List - Card Based */}
        {!isLoading && !isError && transactions.length > 0 && (
          <div className="space-y-3">
            {/* Summary Bar */}
            <div className="flex items-center justify-between px-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {transactions.length} transactions
              </p>
              <Button variant="ghost" size="sm" className="text-xs">
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

              // Format date relative to today
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
                  className="border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-200 hover:shadow-md"
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      {/* Category Icon */}
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${isIncome
                        ? 'bg-green-50 dark:bg-green-950/30'
                        : 'bg-red-50 dark:bg-red-950/30'
                        }`}>
                        {/* <span>{categoryIcons[tx.category as TransactionCategory] || '📦'}</span> */}
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-medium text-gray-900 dark:text-white truncate pr-2">
                            {tx.description}
                          </h3>
                          <Badge
                            variant="secondary"
                            className={`ml-2 ${isIncome
                              ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400'
                              : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                              } border-0`}
                          >
                            {tx.category.name}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
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

                      {/* Amount and Actions */}
                      <div className="flex flex-col items-end gap-2">
                        <span className={`text-lg font-bold ${isIncome ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {isIncome ? '+' : '-'}{formatINR(amount)}
                        </span>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(tx.id)}
                          disabled={deleteTx.isPending}
                          className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
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
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}

            {/* End of List */}
            {!hasNextPage && transactions.length > 0 && (
              <p className="text-center text-xs text-gray-400 py-4">
                You've seen all transactions
              </p>
            )}
          </div>
        )}


        {/* Delete Confirmation Modal */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="sm:max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-semibold text-gray-900 dark:text-white">
                Delete Transaction
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this transaction? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex flex-col sm:flex-row gap-2">
              <AlertDialogCancel className="w-full sm:w-auto border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white border-0"
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