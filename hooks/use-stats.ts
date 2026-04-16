import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export function useDashboard() {
  return useQuery({
    queryKey: ["stats", "dashboard"],
    queryFn: () => api.get("/stats/dashboard").then((r) => r.data),
  });
}

export function useWeeklyStats(weekStart?: string) {
  return useQuery({
    queryKey: ["stats", "weekly", weekStart],
    queryFn: () => api.get("/stats/weekly", { params: weekStart ? { weekStart } : {} }).then((r) => r.data),
    enabled: !!weekStart,
  });
}

export function useMonthlyStats() {
  return useQuery({
    queryKey: ["stats", "monthly"],
    queryFn: () => api.get("/stats/monthly").then((r) => r.data),
  });
}

export function useVehiclesFlow(weekStart?: string) {
  return useQuery({
    queryKey: ["stats", "vehicles-flow", weekStart],
    queryFn: () => api.get("/stats/vehicles-flow", { params: weekStart ? { weekStart } : {} }).then((r) => r.data),
    enabled: !!weekStart,
  });
}

export function useAvgDays() {
  return useQuery<{ avgDays: number; count: number }>({
    queryKey: ["stats", "avg-days"],
    queryFn: () => api.get("/stats/avg-days").then((r) => r.data),
  });
}

export function useTopJobs(limit = 5) {
  return useQuery<{
    description: string; count: number;
    totalRevenue: number; totalExpenses: number;
    totalProfit: number; avgProfit: number;
  }[]>({
    queryKey: ["stats", "top-jobs", limit],
    queryFn: () => api.get("/stats/top-jobs", { params: { limit } }).then((r) => r.data),
  });
}

export function useRevenueVsExpenses() {
  return useQuery<{
    current: { revenue: number; expenses: number; profit: number; count: number };
    previous: { revenue: number; expenses: number; profit: number; count: number };
  }>({
    queryKey: ["stats", "revenue-vs-expenses"],
    queryFn: () => api.get("/stats/revenue-vs-expenses").then((r) => r.data),
  });
}
