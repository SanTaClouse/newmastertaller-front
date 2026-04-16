import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Vehicle {
  id: string;
  brand: string;
  model?: string;
  year?: number;
  plate?: string;
  color?: string;
  notes?: string;
  clientId?: string;
  createdAt: string;
}

export function useVehicles(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery<{ data: Vehicle[]; total: number; page: number; limit: number }>({
    queryKey: ["vehicles", params],
    queryFn: () => api.get("/vehicles", { params }).then((r) => r.data),
  });
}

export function useVehicle(id: string) {
  return useQuery<Vehicle>({
    queryKey: ["vehicles", id],
    queryFn: () => api.get(`/vehicles/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function useUpdateVehicle(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Vehicle>) =>
      api.patch(`/vehicles/${id}`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles"] });
      qc.invalidateQueries({ queryKey: ["vehicles", id] });
    },
  });
}
