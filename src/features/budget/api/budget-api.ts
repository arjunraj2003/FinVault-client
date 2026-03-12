import axiosInstance from "@/lib/axios";
import { BudgetListResponse, BudgetProgressResponse, CreateBudgetDto } from "../types";

export class BudgetApi {

  static create(data: CreateBudgetDto) {
    return axiosInstance.post("/budget", data);
  }

  static getAll() {
    return axiosInstance.get<BudgetListResponse>("/budget");
  }

  static update(budgetId: string, data: CreateBudgetDto) {
    return axiosInstance.put(`/budget/${budgetId}`, data);
  }

  static delete(budgetId: string) {
    return axiosInstance.delete(`/budget/${budgetId}`);
  }

  static getProgress(budgetId: string) {
    return axiosInstance.get<BudgetProgressResponse>(
      `/budget/progress/${budgetId}`
    );
  }
}