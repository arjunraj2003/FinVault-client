import { useState } from "react";
import { useDashboard } from "../hooks/use-dashboard";
import { useAccounts } from "@/features/account/hooks/use-accounts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, TrendingDown, IndianRupee, Wallet, Calendar, Filter } from "lucide-react";

const CHART_COLORS = [
  "#2563eb",
  "#16a34a",
  "#ea580c",
  "#dc2626",
  "#7c3aed",
  "#0891b2",
  "#c026d3",
];

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

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
  const currentMonth = new Date().getMonth() + 1; // ✅ 1-based to match backend

  const [year, setYear] = useState(currentYear);
  const [month, setMonth] = useState(currentMonth); // ✅ 1-based (1=Jan ... 12=Dec)
  const [selectedAccount, setSelectedAccount] = useState<string>("");

  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const accountId = selectedAccount || accounts?.[0]?.id || "";

  const { data: dashboardResponse, isLoading } = useDashboard(accountId, year, month);
  const summary = dashboardResponse?.data;

  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const formattedMonthlyData = summary?.monthlyData?.map(item => ({
    ...item,
    monthName: MONTH_NAMES[item.month - 1],
  })) || [];

  const totalIncome = summary?.totals?.income || 0;
  const totalExpense = summary?.totals?.expense || 0;
  const netBalance = summary?.totals?.net || 0;

  // ✅ Current month data from monthlyData array (month is 1-based, array is 0-based)
  const currentMonthData = summary?.monthlyData?.[month - 1];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#0B1426] dark:to-[#0F1A2F] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                Dashboard
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Your financial overview
              </p>
            </div>

            {!isLoading && summary && (
              <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                netBalance >= 0
                  ? 'bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 border border-green-200 dark:border-green-900'
                  : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400 border border-red-200 dark:border-red-900'
              }`}>
                {netBalance >= 0 ? 'Net +' : 'Net '}{formatINR(Math.abs(netBalance))}
              </div>
            )}
          </div>

          {/* ✅ Filters Row — Account | Year | Month all in one line */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">

            {/* Account Filter */}
            <Select value={selectedAccount || accountId} onValueChange={setSelectedAccount}>
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

            {/* Year Filter */}
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger className="h-10 min-w-[100px] bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800 rounded-xl text-sm shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* ✅ Month Filter — NEW */}
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger className="h-10 min-w-[100px] bg-white dark:bg-[#0F1A2F] border-gray-200 dark:border-gray-800 rounded-xl text-sm shadow-sm hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <Filter className="w-3.5 h-3.5 mr-1.5 text-gray-500 flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTH_NAMES.map((name, i) => (
                  <SelectItem key={i + 1} value={String(i + 1)}>
                    {name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

          </div>
        </div>

        {/* Mobile Quick Stats */}
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

        {/* Summary Cards — Desktop */}
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
              <SummaryCard title="Total Income" value={totalIncome} icon={TrendingUp} type="income" />
              <SummaryCard title="Total Expense" value={totalExpense} icon={TrendingDown} type="expense" />
              <SummaryCard title="Net Balance" value={netBalance} icon={IndianRupee} type="neutral" />
            </>
          )}
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">

          {/* Monthly Bar Chart */}
          <Card className="lg:col-span-2 border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Monthly Overview — {year}
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
                      <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} interval={window.innerWidth < 640 ? 1 : 0} />
                      <YAxis tick={{ fontSize: 11, fill: "hsl(220, 9%, 46%)" }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                        formatter={(value: number) => [formatINR(value), '']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Bar dataKey="income" fill="#16a34a" radius={[6, 6, 0, 0]} name="Income" maxBarSize={50} />
                      <Bar dataKey="expense" fill="#dc2626" radius={[6, 6, 0, 0]} name="Expense" maxBarSize={50} />
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

          {/* ✅ Category Pie Chart — header now shows selected month name */}
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                Expense Breakdown
              </CardTitle>
              {/* ✅ Shows which month the breakdown is for */}
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {MONTH_NAMES[month - 1]} {year} · by category
              </p>
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
                            <text x={x} y={y} fill="#666" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central" fontSize={10}>
                              {`${name} ${percent * 100 < 1 ? "<1" : (percent * 100).toFixed(0)}%`}
                            </text>
                          );
                        }}
                      >
                        {summary.categoryBreakdown.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [formatINR(value), 'Amount']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-64 sm:h-72 flex items-center justify-center text-gray-400">
                  No expenses in {MONTH_NAMES[month - 1]}
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* ✅ Selected Month Overview — driven by month state, not hardcoded new Date() */}
        {!isLoading && currentMonthData && (
          <Card className="border-gray-200 dark:border-gray-800 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                {MONTH_NAMES[month - 1]} {year} Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Month</p>
                  <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                    {MONTH_NAMES[month - 1]}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Income</p>
                  <p className="text-lg sm:text-xl font-bold text-green-600 dark:text-green-400">
                    {formatINR(currentMonthData.income)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expense</p>
                  <p className="text-lg sm:text-xl font-bold text-red-600 dark:text-red-400">
                    {formatINR(currentMonthData.expense)}
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Savings</p>
                  <p className={`text-lg sm:text-xl font-bold ${currentMonthData.net >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {formatINR(currentMonthData.net)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

function SummaryCard({ title, value, icon: Icon, type }: {
  title: string; value: number; icon: typeof TrendingUp; type: "income" | "expense" | "neutral";
}) {
  const getIconClass = () => {
    if (type === "income") return "text-green-600";
    if (type === "expense") return "text-red-600";
    return "text-blue-600";
  };
  const getValueClass = () => {
    if (type === "income") return "text-green-600";
    if (type === "expense") return "text-red-600";
    return value >= 0 ? "text-green-600" : "text-red-600";
  };
  return (
    <Card className="border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</CardTitle>
        <div className={`p-2 rounded-lg ${type === 'income' ? 'bg-green-50 dark:bg-green-950/30' : type === 'expense' ? 'bg-red-50 dark:bg-red-950/30' : 'bg-blue-50 dark:bg-blue-950/30'}`}>
          <Icon className={`h-4 w-4 ${getIconClass()}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-xl sm:text-2xl font-bold ${getValueClass()}`}>{formatINR(value)}</div>
        <p className="text-xs text-gray-400 mt-1">Year {new Date().getFullYear()}</p>
      </CardContent>
    </Card>
  );
}