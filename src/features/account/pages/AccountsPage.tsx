import { useAccounts, useCreditCardSummary } from "../hooks/use-accounts";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Wallet, TrendingUp, CreditCard, PiggyBank, Plus, IndianRupee, MoreHorizontal, Eye, EyeOff } from "lucide-react";
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
    bg: "bg-primary",
    text: "text-primary",
    lightBg: "bg-primary/10",
    gradient: "from-primary/80 to-primary",
    border: "border-primary/20"
  },
  savings: {
    bg: "bg-green-500",
    text: "text-green-500",
    lightBg: "bg-green-500/10",
    gradient: "from-green-500/80 to-green-500",
    border: "border-green-500/20"
  },
  credit: {
    bg: "bg-destructive",
    text: "text-destructive",
    lightBg: "bg-destructive/10",
    gradient: "from-destructive/80 to-destructive",
    border: "border-destructive/20"
  },
  investment: {
    bg: "bg-purple-500",
    text: "text-purple-500",
    lightBg: "bg-purple-500/10",
    gradient: "from-purple-500/80 to-purple-500",
    border: "border-purple-500/20"
  },
};

const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

function CreditCardDetailsView({ accountId, hideBalances }: { accountId: string, hideBalances: boolean }) {
  const { data, isLoading } = useCreditCardSummary(accountId);
  if (isLoading || !data) return <Skeleton className="h-10 w-full mt-2" />;
  
  const utilization = (data.currentBalance / data.creditLimit) * 100;

  return (
    <div className="mt-4 pt-3 border-t border-border">
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">Unbilled: {hideBalances ? '₹•••' : formatINR(data.unbilledAmount)}</span>
        <span className="text-muted-foreground">Debt: {hideBalances ? '₹•••' : formatINR(data.currentBalance)}</span>
      </div>
      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden my-2">
        <div className={`h-1.5 rounded-full ${utilization > 80 ? 'bg-destructive' : utilization > 50 ? 'bg-yellow-500' : 'bg-primary'}`} style={{ width: `${Math.min(utilization, 100)}%` }}></div>
      </div>
      <div className="flex justify-between text-[11px] mt-2 text-muted-foreground">
        <span>Bill on: {data.statementDay}th</span>
        <span>Due on: {data.dueDay}th</span>
      </div>
    </div>
  );
}

export default function AccountsPage() {
  const { data: accounts, isLoading, isError } = useAccounts();
  const navigate = useNavigate();
  const [hideBalances, setHideBalances] = useState(false);

  const totalBalance = accounts?.reduce((sum, acc) => {
    if (acc.type === 'credit') {
      return sum;
    }
    return sum + (Number(acc.balance) || 0);
  }, 0) || 0;

  if (isLoading) {
    return (
      <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-12 w-32 rounded-xl" />
          </div>

          <Skeleton className="h-24 w-full rounded-2xl" />

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="border-border bg-card">
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

  if (isError) {
    return (
      <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border bg-card">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="h-8 w-8 text-destructive" />
              </div>
              <p className="text-lg font-medium text-foreground mb-2">Unable to load accounts</p>
              <p className="text-sm text-muted-foreground mb-6">Please ensure your backend is running</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors"
              >
                Try Again
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <Card className="border-border bg-card">
            <CardContent className="py-20 text-center">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Wallet className="h-10 w-10 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">No accounts yet</h2>
              <p className="text-muted-foreground mb-8">Create your first account to start tracking your finances</p>
              <button
                onClick={() => navigate("/accounts/create")}
                className="inline-flex items-center px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg"
              >
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Create Your First Account
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Accounts
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage and track all your financial accounts
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Hide/Show Balance Toggle */}
            <button
              onClick={() => setHideBalances(!hideBalances)}
              className="p-3 bg-card border border-border rounded-xl text-foreground hover:bg-accent transition-colors"
              title={hideBalances ? "Show balances" : "Hide balances"}
            >
              {hideBalances ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>

            {/* Enhanced Add Button */}
            <button
              onClick={() => navigate("/accounts/create")}
              className="group relative inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 transition-all duration-200 shadow-lg active:scale-95"
            >
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              <span>Add New</span>
            </button>
          </div>
        </div>

        {/* Total Balance Card */}
        <Card className="border-border bg-gradient-to-br from-primary via-primary/95 to-indigo-950 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-16 -mb-16" />

          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-primary-foreground/90">Total Balance</p>
                  <span className="px-2 py-0.5 bg-white/10 text-white text-xs rounded-full">
                    All Accounts
                  </span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold text-white">
                  {hideBalances ? '₹••••••' : formatINR(totalBalance)}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <p className="text-xs text-primary-foreground/80">
                    Across {accounts.length} {accounts.length === 1 ? 'account' : 'accounts'}
                  </p>
                  <span className="w-1 h-1 bg-white/45 rounded-full" />
                  <p className="text-xs text-primary-foreground/80">
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
                className="group relative border-border bg-card hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${colors.gradient}`} />

                <CardHeader className="flex flex-row items-center justify-between pb-2 pt-4">
                  <CardTitle className="text-sm font-medium text-foreground">
                    {account.name}
                  </CardTitle>
                  <div className={`p-2.5 rounded-xl ${colors.lightBg} border ${colors.border} shadow-sm`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="mb-3">
                    <p className="text-xs text-muted-foreground mb-1">{account.type === 'credit' ? 'Available Credit' : 'Current Balance'}</p>
                    <div className="text-2xl font-bold text-foreground">
                      {hideBalances ? '₹••••••' : formatINR(balance)}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    <Badge variant="secondary" className={`capitalize ${colors.lightBg} ${colors.text} border-0 px-3 py-1 text-xs font-medium`}>
                      {account.type}
                    </Badge>

                    <button className="p-1.5 rounded-lg hover:bg-accent transition-colors">
                      <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>
                  
                  {account.type === 'credit' && (
                    <CreditCardDetailsView accountId={account.id} hideBalances={hideBalances} />
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </CardContent>
              </Card>
            );
          })}

          {/* Quick Add Card */}
          <button
            onClick={() => navigate("/accounts/create")}
            className="group relative border-2 border-dashed border-border rounded-xl p-6 hover:border-primary transition-all duration-300 hover:shadow-lg hover:-translate-y-1 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="relative flex flex-col items-center justify-center h-full min-h-[180px]">
              <div className="w-14 h-14 bg-muted rounded-xl flex items-center justify-center mb-3 group-hover:bg-primary/10 transition-all duration-300 group-hover:scale-110">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                Add New Account
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Create another account
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}