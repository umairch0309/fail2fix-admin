"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { apiGet } from "@/lib/api-client";
import type { DashboardStats, DateRange } from "@/types/dashboard";

export function useDashboardStats(range: DateRange = "7days") {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(range),
    queryFn: async (): Promise<DashboardStats> =>
      apiGet<DashboardStats>("/api/dashboard/stats", { range }),
    staleTime: 1 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
  });
}
