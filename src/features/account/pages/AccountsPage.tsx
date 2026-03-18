import { useAccounts } from "../hooks/use-accounts";
import { CreateAccountModal } from "../components/CreateAccountModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, CreditCard, PiggyBank, Plus, IndianRupee, ArrowUpRight, ArrowDownRight, MoreHorizontal, Eye, EyeOff } from "lucide-react";
import type { AccountType } from "../types";
import { useState } from "react";

const typeIcons: Record<AccountType, typeof Wallet> = {
  checking: Wallet,
  savings: PiggyBank,
  credit: CreditCard,
  investment: TrendingUp,
};

const typeColors: Record<AccountType, { bg: string; text: string; lightBg: string; gradient: string; border: string }> = {
  checking: {
    bg: "bg-blue-600",
    text: "text-blue-600",
    lightBg: "bg-blue-50 dark:bg-blue-950/30",
    gradient: "from-blue-500 to-blue-600",
    border: "border-blue-200 dark:border-blue-900"
  },
  savings: {
    bg: "bg-green-600",
    text: "text-green-600",
    lightBg: "bg-green-50 dark:bg-green-950/30",
    gradient: "from-green-500 to-green-600",
    border: "border-green-200 dark:border-green-900"
  },
  credit: {
    bg: "bg-red-600",
    text: "text-red-600",
    lightBg: "bg-red-50 dark:bg-red-950/30",
    gradient: "from-red-500 to-red-600",
    border: "border-red-200 dark:border-red-900"
  },
  investment: {
    bg: "bg-purple-600",
    text: "text-purple-600",
    lightBg: "bg-purple-50 dark:bg-purple-950/30",
    gradient: "from-purple-500 to-purple-600",
    border: "border-purple-200 dark:border-purple-900"
  },
};

// Format currency to Indian Rupees
const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function AccountsPage() {
  const { data: accounts, isLoading, isError } = useAccounts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hideBalances, setHideBalances] = useState(false);

  // Calculate total balance for all accounts
  const totalBalance = accounts?.reduce((sum, acc) => sum + (Number(acc.balance) || 0), 0) || 0;

  // Show loading skeletons
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header with Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>

          {/* Total Balance Skeleton */}
          <Skeleton className="h-24 w-full rounded-2xl" />

          {/* Accounts Grid Skeleton */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-gray-200 dark:border-gray-800">
                <CardHeader className="pb-2">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-24 mb-2" />
                  <Skeleton className="h-4 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">Unable to load accounts</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please ensure your backend is running</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show empty state
  if (!accounts || accounts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-blue-50 dark:bg-blue-950/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="h-10 w-10 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No accounts yet</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-8">Create your first account to start tracking your finances</p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/20"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Account
              </button>
            </CardContent>
          </Card>
        </div>
        <CreateAccountModal open={isModalOpen} onOpenChange={setIsModalOpen} />
      </div>
    );
  }

  // Show accounts list
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Accounts
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage and track all your financial accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Hide/Show Balance Toggle */}
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-3 bg-white dark:bg-[#0F1A2F] border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              title={hideBalances ? "Show balances" : "Hide balances"}
            >
              {hideBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Enhanced Add Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="group relative inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/30 active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card className="border-gray-200 dark:border-gray-800 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 shadow-xl overflow-hidden relative">
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16" />

          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-blue-100">Total Balance</p>
                  <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded-full">
                    All Accounts
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {hideBalances ? '₹••••••' : formatINR(totalBalance)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs text-blue-200">
                    Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                  </p>
                  <span className="w-1 h-1 bg-blue-400 rounded-full" />
                  <p className="text-xs text-blue-200">
                    Last updated today
                  </p>
                </div>
              </div>
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <IndianRupee className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Accounts Grid */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {accounts.map((account) => {
            const Icon = typeIcons[account.type] || Wallet;
            const colors = typeColors[account.type] || typeColors.checking;
            const balance = Number(account.balance) || 0;

            return (
              <Card
                key={account.id}
                className="group relative border-gray-200 dark:border-gray-800 hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300 hover:shadow-xl hover:shadow-blue-600/10 hover:-translate-y-1 overflow-hidden"
              >
                {/* Card Header Gradient Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

                {/* Card Content */}
                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <CardTitle className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {account.name}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${colors.lightBg} border ${colors.border} shadow-sm`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {hideBalances ? '₹••••••' : formatINR(balance)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
                    <Badge variant="secondary" className={`capitalize ${colors.lightBg} ${colors.text} border-0 px-3 py-1 text-xs font-medium`}>
                      {account.type}
                    </Badge>

                    {/* Quick Action Dots */}
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>

                  {/* Hover Overlay Effect */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 dark:to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </CardContent>
              </Card>
            );
          })}

          {/* Quick Add Card - Enhanced */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="group relative border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-300 hover:shadow-lg hover:shadow-blue-600/10 hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent dark:from-blue-950/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col items-center justify-center h-full min-h-[180px]">
              <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl flex items-center justify-center mb-3 group-hover:from-blue-100 group-hover:to-blue-50 dark:group-hover:from-blue-900/30 dark:group-hover:to-blue-800/30 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-blue-600/20">
                <Plus className="w-6 h-6 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                Add New Account
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Create another account
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Create Account Modal */}
      <CreateAccountModal open={isModalOpen} onOpenChange={setIsModalOpen} />
    </div>
  );
}