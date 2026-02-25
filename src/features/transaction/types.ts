export type TransactionType = "credit" | "debit";

export type TransactionCategory =
  | "salary"
  | "investment"
  | "food"
  | "transport"
  | "entertainment"
  | "utilities"
  | "shopping"
  | "health"
  | "other";

export interface Account {
  id: string;
  name: string;
  balance: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: string;
  category: TransactionCategory;
  description: string;
  createdAt: string;
  transactionDate: string;
  account: Account;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface TransactionListResponse {
  success: boolean;
  message: string;
  data: {
    data: Transaction[];
    meta: PaginationMeta;
  };
}

export interface CreateTransactionDto{
  type:TransactionType;
  amount:string;
  accountId:string;
  category:string;
  description:string;
  transactionDate:string;
}