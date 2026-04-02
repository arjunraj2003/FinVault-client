import { useQuery } from "@tanstack/react-query";
import { DashboardApi } from "../api/dashboard-api";
import { DashboardSummary } from "../types";

export function useDashboard(accountId: string, year: number,month:number) {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", accountId, year,month],
    queryFn: async () => {
      const response = await DashboardApi.getSummary(accountId, year,month);
     
      return response.data; // unwrap API response properly
    },
    enabled: !!accountId,
  });
}