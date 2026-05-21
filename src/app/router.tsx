import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// 🔥 Lazy loaded pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const AccountsPage = lazy(() => import("@/features/account/pages/AccountsPage"));
const CreateAccountPage = lazy(() => import("@/features/account/pages/CreateAccountPage"));
const TransactionsPage = lazy(() => import("@/features/transaction/pages/TransactionsPage"));
const CreateTransactionPage = lazy(() => import("@/features/transaction/pages/CreateTransactionPage"));
const BudgetsPage = lazy(() => import("@/features/budget/pages/BudgetsPage"));
const CreateBudgetPage = lazy(() => import("@/features/budget/pages/CreateBudgetPage"));
const CategoryPage = lazy(() => import("@/features/category/Categorypage"));
const CreateCategoryPage = lazy(() => import("@/features/category/pages/CreateCategoryPage"));
const ChatPage = lazy(() => import("@/features/chat/chatPage"));
const ImportTransactionPage = lazy(() => import("@/features/transaction/pages/ImportTransactionPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

import { Wallet } from "lucide-react";

const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center">
    <div className="relative flex items-center justify-center w-24 h-24">
      <div className="absolute inset-0 w-24 h-24 border-[3px] border-muted border-t-primary rounded-full animate-spin"></div>
      <div className="w-16 h-16 flex items-center justify-center bg-primary/10 rounded-full animate-pulse">
        <Wallet className="w-8 h-8 text-primary" />
      </div>
    </div>
    <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse tracking-wide">
      Loading Finvalt...
    </p>
  </div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/accounts/create" element={<CreateAccountPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/transactions/create" element={<CreateTransactionPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/budgets/create" element={<CreateBudgetPage />} />
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/category/create" element={<CreateCategoryPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/import-transaction" element={<ImportTransactionPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
