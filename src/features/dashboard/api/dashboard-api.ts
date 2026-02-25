import axiosInstance from "@/lib/axios";
import type { DashboardSummary } from "../types";

export class DashboardApi {
  static getSummary(accountId: string, year: number) {
    return axiosInstance.get<DashboardSummary>("/dashboard/summary", {
      params: { accountId, year },
    });
  }
}
