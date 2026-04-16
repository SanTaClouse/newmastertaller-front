import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface RepairPhase {
  id: string;
  name: string;
  description?: string;
  orderIndex: number;
  icon?: string;
  isDefault: boolean;
}

export function useRepairPhases() {
  return useQuery<RepairPhase[]>({
    queryKey: ["repair-phases"],
    queryFn: () => api.get("/repair-phases").then((r) => r.data),
  });
}

export function useCreatePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; orderIndex: number; icon?: string; description?: string }) =>
      api.post("/repair-phases", data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repair-phases"] }),
  });
}

export function useUpdatePhase(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<RepairPhase>) =>
      api.patch(`/repair-phases/${id}`, data).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repair-phases"] }),
  });
}

export function useDeletePhase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/repair-phases/${id}`).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repair-phases"] }),
  });
}

export function useReorderPhases() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (phases: { id: string; orderIndex: number }[]) =>
      api.patch("/repair-phases/reorder", { phases }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["repair-phases"] }),
  });
}
