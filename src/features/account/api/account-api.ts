import axiosInstance from "@/lib/axios";
import type { Account, CreateAccountDto, BalanceResponse, AccountRes } from "../types";

export class AccountApi {
  static create(data: CreateAccountDto) {
    return axiosInstance.post<Account>("/account/create", data);
  }

  static getAccounts() {
    return axiosInstance.get<AccountRes>("/account/getAccounts");
  }

  static getBalance(accountId: string) {
    return axiosInstance.get<BalanceResponse>(`/account/getBalance/${accountId}`);
  }
}
