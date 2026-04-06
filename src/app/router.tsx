import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";

import { ProtectedRoute } from "@/features/auth/components/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

// 🔥 Lazy loaded pages
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const DashboardPage = lazy(() => import("@/features/dashboard/pages/DashboardPage"));
const AccountsPage = lazy(() => import("@/features/account/pages/AccountsPage"));
const TransactionsPage = lazy(() => import("@/features/transaction/pages/TransactionsPage"));
const BudgetsPage = lazy(() => import("@/features/budget/pages/BudgetsPage"));
const CategoryPage = lazy(() => import("@/features/category/Categorypage"));
const ChatPage = lazy(() => import("@/features/chat/chatPage"));
const NotFound = lazy(() => import("@/pages/NotFound"));

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/accounts" element={<AccountsPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/budgets" element={<BudgetsPage />} />
              <Route path="/category" element={<CategoryPage />} />
              <Route path="/chat" element={<ChatPage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}