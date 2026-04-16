import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => api.get("/stats/dashboard").then((r) => r.data),
  });
}

export function useWeeklyStats() {
  return useQuery({
    queryKey: ["stats", "weekly"],
    queryFn: () => api.get("/stats/weekly").then((r) => r.data),
  });
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ["stats", "monthly"],
    queryFn: () => api.get("/stats/monthly").then((r) => r.data),
  });
}
