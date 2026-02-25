export interface DashboardSummary {
  data: {
    year: number;
    monthlyData: MonthlyData[];
    totals: Totals;
    categoryBreakdown: CategoryData[];
  };

}

export interface MonthlyData {
  month: number;   // backend sends number (1–12)
  income: number;
  expense: number;
  net: number;
}

export interface Totals {
  income: number;
  expense: number;
  net: number;
}

export interface CategoryData {
  category: string;
  amount: number;
}

export interface DashboardParams {
  accountId: string;
  year: number;
}