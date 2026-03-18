import axiosInstance from "@/lib/axios";
import type { CreateTransactionDto, Transaction, TransactionListResponse } from "../types";

export class TransactionApi {
  static create(data: CreateTransactionDto) {
    return axiosInstance.post<Transaction>("/transaction/create", data);
  }

  static getAll(params?: any) {
    return axiosInstance.get<TransactionListResponse>("/transaction/getAll", { params });
  }

  static deleteTrans(transactionId: string) {
    return axiosInstance.delete(`/transaction/delete/${transactionId}`);
  }
}
