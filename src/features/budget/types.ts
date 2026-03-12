export interface CreateBudgetDto {
  category: string;
  amount: string;
  startDate: string;
  endDate: string;
}

export interface Budget {
  id: string;
  category: string;
  amount: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

export interface BudgetListResponse {
  success: boolean;
  message: string;
  data: Budget[];
}

export interface BudgetProgress {
  budget: Budget;
  totalSpent: number;
  remainingLimit: number;
  progressPercentage: number;
}

export interface BudgetProgressResponse {
  success: boolean;
  message: string;
  data: BudgetProgress;
}