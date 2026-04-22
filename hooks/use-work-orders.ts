import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface WorkOrder {
  id: string;
  trackingCode: string;
  description?: string;
  diagnosis?: string;
  laborCost: number;
  totalPrice: number;
  status: "new" | "progress" | "delayed" | "completed" | "incomplete" | "retired";
  currentPhaseId?: string;
  enteredAt: string;
  completedAt?: string;
  retiredAt?: string;
  createdAt: string;
  vehicle?: {
    id: string; brand: string; model?: string; year?: number; plate?: string; color?: string; engine?: string;
    lastMileage?: number; lastMileageAt?: string;
  };
  client?: { id: string; fullName: string; phone: string };
  expenses?: Expense[];
  phaseLogs?: PhaseLog[];
  totalExpenses?: number;
  netProfit?: number;
}

export interface Expense {
  id: string; description: string; cost: number; createdAt: string;
}

export interface PhaseLog {
  id: string; phaseId: string; enteredAt: string; completedAt?: string; notes?: string;
}

interface Paginated<T> {
  data: T[]; total: number; page: number; limit: number;
}

export function useWorkOrders(params?: {
  page?: number; limit?: number; status?: string; search?: string;
  from?: string; to?: string; includeFinancials?: boolean; vehicleId?: string;
}) {
  return useQuery<Paginated<WorkOrder>>({
    queryKey: ["work-orders", params],
    queryFn: () => api.get("/work-orders", { params }).then((r) => r.data),
  });
}

export function useWorkOrder(id: string) {
  return useQuery<WorkOrder>({
    queryKey: ["work-orders", id],
    queryFn: () => api.get(`/work-orders/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.post("/work-orders", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders"] }),
  });
}

export function useUpdateWorkOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      api.patch(`/work-orders/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      qc.invalidateQueries({ queryKey: ["work-orders", id] });
    },
  });
}

export function useCompleteWorkOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/work-orders/${id}/complete`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      qc.invalidateQueries({ queryKey: ["work-orders", id] });
    },
  });
}

export function useAdvancePhase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/work-orders/${id}/advance-phase`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      qc.invalidateQueries({ queryKey: ["work-orders", id] });
    },
  });
}

export function useSetPhase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { phaseId: string; notes?: string }) =>
      api.post(`/work-orders/${id}/set-phase`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders", id] });
    },
  });
}

export function useAddExpense(workOrderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { description: string; cost: number }) =>
      api.post(`/work-orders/${workOrderId}/expenses`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders", workOrderId] }),
  });
}

export function useDeleteExpense(workOrderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (expenseId: string) =>
      api.delete(`/expenses/${expenseId}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["work-orders", workOrderId] }),
  });
}

export function useRetireWorkOrder(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => api.post(`/work-orders/${id}/retire`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["work-orders"] });
      qc.invalidateQueries({ queryKey: ["work-orders", id] });
    },
  });
}
