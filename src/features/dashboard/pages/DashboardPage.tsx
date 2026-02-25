import { useState } from "react";
import { useDashboard } from "../hooks/use-dashboard";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, Wallet, Calendar, Filter } from "lucide-react";

const CHART_COLORS = [
  "#2563eb", // Blue
  "#16a34a", // Green
  "#ea580c", // Orange
  "#dc2626", // Red
  "#7c3aed", // Purple
  "#0891b2", // Cyan
  "#c026d3", // Pink
];

// Month names for better display
const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

// Format currency to Indian Rupees
const formatINR = (value: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function DashboardPage() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const accountId = selectedAccount || accounts?.[0]?.id || "";
  const { data: dashboardResponse, isLoading } = useDashboard(accountId, year);

  const summary = dashboardResponse?.data;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  // Format monthly data with month names for better display
  const formattedMonthlyData = summary?.monthlyData?.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month - 1],
    month: item.month
  })) || [];

  // Calculate totals for mobile summary
  const totalIncome = summary?.totals?.income || 0;
  const totalExpense = summary?.totals?.expense || 0;
  const netBalance = summary?.totals?.net || 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              Dashboard
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Your financial overview at a glance
            </p>
          </div>

          {/* Filters - Stack on mobile, row on desktop */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Select value={selectedAccount || accountId} onValueChange={setSelectedAccount}>
              <SelectTrigger className="w-full sm:w-48 bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800">
                <Wallet className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue placeholder={accountsLoading ? "Loading..." : "Select account"} />
              </SelectTrigger>
              <SelectContent>
                {accounts?.map((a) => (
                  <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="w-full sm:w-28 bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800">
                <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Quick Stats - Only visible on mobile */}
        {!isLoading && summary && (
          <div className="grid grid-cols-3 gap-2 sm:hidden">
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Income</p>
              <p className="text-sm font-semibold text-green-600 dark:text-green-400">{formatINR(totalIncome)}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Expense</p>
              <p className="text-sm font-semibold text-red-600 dark:text-red-400">{formatINR(totalExpense)}</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-3">
              <p className="text-xs text-gray-500 dark:text-gray-400">Net</p>
              <p className={`text-sm font-semibold ${netBalance >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatINR(netBalance)}
              </p>
            </div>
          </div>
        )}

        {/* Summary Cards - Desktop */}
        <div className="hidden sm:grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200 dark:border-gray-800 shadow-sm">
                <CardHeader><Skeleton className="h-4 w-24" /></CardHeader>
                <CardContent><Skeleton className="h-8 w-20" /></CardContent>
              </Card>
            ))
          ) : (
            <>
              <SummaryCard
                title="Total Income"
                value={totalIncome}
                icon={TrendingUp}
                type="income"
              />
              <SummaryCard
                title="Total Expense"
                value={totalExpense}
                icon={TrendingDown}
                type="expense"
              />
              <SummaryCard
                title="Net Balance"
                value={netBalance}
                icon={IndianRupee}
                type="neutral"
              />
            </>
          )}
        </div>

        {/* Charts Section */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          {/* Monthly Bar Chart - Full width on mobile, 2/3 on desktop */}
          <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Overview - {year}
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">Income vs Expense trend</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 sm:h-72 w-full" />
              ) : formattedMonthlyData.length > 0 ? (
                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer>
                    <BarChart data={formattedMonthlyData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 13%, 91%)" />
                      <XAxis
                        dataKey="monthName"
                        tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                        interval={window.innerWidth < 640 ? 1 : 0}
                      />
                      <YAxis
                        tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }}
                        tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "white",
                          border: "1px solid #e2e8f0",
                          borderRadius: "12px",
                          boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                        }}
                        formatter={(value: number) => [formatINR(value), '']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar
                        dataKey="income"
                        fill="#16a34a"
                        radius={[6, 6, 0, 0]}
                        name="Income"
                        maxBarSize={50}
                      />
                      <Bar
                        dataKey="expense"
                        fill="#dc2626"
                        radius={[6, 6, 0, 0]}
                        name="Expense"
                        maxBarSize={50}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 sm:h-72 flex items-center justify-center text-gray-400">
                  No data available for {year}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Category Pie Chart */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Expense Breakdown
              </CardTitle>
              <p className="text-xs text-gray-500 dark:text-gray-400">By category</p>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-64 sm:h-72 w-full" />
              ) : summary?.categoryBreakdown && summary.categoryBreakdown.length > 0 ? (
                <div className="w-full h-64 sm:h-72">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={summary.categoryBreakdown}
                        dataKey="total"
                        nameKey="category"
                        cx="50%"
                        cy="50%"
                        outerRadius={window.innerWidth < 640 ? 70 : 90}
                        innerRadius={window.innerWidth < 640 ? 30 : 40}
                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                          const RADIAN = Math.PI / 180;
                          const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
                          const x = cx + radius * Math.cos(-midAngle * RADIAN);
                          const y = cy + radius * Math.sin(-midAngle * RADIAN);

                          return (
                            <text
                              x={x}
                              y={y}
                              fill="#666"
                              textAnchor={x > cx ? "start" : "end"}
                              dominantBaseline="central"
                              fontSize={10}   // 🔥 CHANGE SIZE HERE
                            >
                              {`${name} ${(percent * 100 < 1
                                ? "<1"
                                : (percent * 100).toFixed(0)
                              )}%`}
                            </text>
                          );
                        }}
                      >
                        {summary.categoryBreakdown.map((_, i) => (
                          <Cell
                            key={i}
                            fill={CHART_COLORS[i % CHART_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => [formatINR(value), 'Amount']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 sm:h-72 flex items-center justify-center text-gray-400">
                  No category data
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Current Month Overview - Mobile optimized */}
        {!isLoading && summary?.monthlyData && summary.monthlyData.length > 0 && (
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Current Month Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Month</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {MONTH_NAMES[new Date().getMonth()]}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Income</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                    {formatINR(summary.monthlyData[new Date().getMonth()]?.income || 0)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expense</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                    {formatINR(summary.monthlyData[new Date().getMonth()]?.expense || 0)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Savings</p>
                  <p className={`text-lg sm:text-xl font-bold ${(summary.monthlyData[new Date().getMonth()]?.income - summary.monthlyData[new Date().getMonth()]?.expense) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatINR((summary.monthlyData[new Date().getMonth()]?.income || 0) - (summary.monthlyData[new Date().getMonth()]?.expense || 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon: Icon,
  type
}: {
  title: string;
  value: number;
  icon: typeof TrendingUp;
  type: "income" | "expense" | "neutral";
}) {
  const getIconClass = () => {
    switch (type) {
      case "income": return "text-green-600";
      case "expense": return "text-red-600";
      default: return "text-blue-600";
    }
  };

  const getValueClass = () => {
    if (type === "income") return "text-green-600";
    if (type === "expense") return "text-red-600";
    return value >= 0 ? "text-green-600" : "text-red-600";
  };

  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </CardTitle>
        <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-green-50 dark:bg-green-950/30' :
          type === 'expense' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-blue-50 dark:bg-blue-950/30'}`}>
          <Icon className={`h-4 w-4 ${getIconClass()}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${getValueClass()}`}>
          {formatINR(value)}
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Year {new Date().getFullYear()}
        </p>
      </CardContent>
    </Card>
  );
}