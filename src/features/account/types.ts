export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
}

export interface AccountRes {
  data: Account[];
}

export type AccountType = "checking" | "savings" | "credit" | "investment";

export interface CreateAccountDto {
  name: string;
  type: AccountType;
  currency: string;
  balance: string;
}

export interface BalanceResponse {
  accountId: string;
  balance: number;
  currency: string;
}

export interface AccountsResponse {
  accounts: Account[];
}
