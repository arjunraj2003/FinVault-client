export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  currency: string;
  createdAt: string;
  creditCardDetails?: CreditCardDetails;
}

export interface CreditCardDetails {
  id: string;
  creditLimit: string;
  statementDay: number;
  dueDay: number;
  interestRate?: string;
}

export interface CreditCardSummary {
  creditLimit: number;
  availableCredit: number;
  currentBalance: number;
  unbilledAmount: number;
  cycleStartDate: string;
  statementDay: number;
  dueDay: number;
  recentStatements: any[];
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
  creditLimit?: number;
  statementDay?: number;
  dueDay?: number;
}

export interface BalanceResponse {
  accountId: string;
  balance: number;
  currency: string;
}

export interface AccountsResponse {
  accounts: Account[];
}
