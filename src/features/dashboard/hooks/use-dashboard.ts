import { useQuery } from "@tanstack/react-query";
import { DashboardApi } from "../api/dashboard-api";
import { DashboardSummary } from "../types";

export function useDashboard(accountId: string, year: number) {
  return useQuery<DashboardSummary>({
    queryKey: ["dashboard", accountId, year],
    queryFn: async () => {
      const response = await DashboardApi.getSummary(accountId, year);
     
      return response.data; // unwrap API response properly
    },
    enabled: !!accountId,
  });
}