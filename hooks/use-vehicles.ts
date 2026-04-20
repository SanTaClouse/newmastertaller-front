import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface Vehicle {
  id: string;
  brand: string;
  model?: string;
  year?: number;
  plate?: string;
  color?: string;
  engine?: string;
  notes?: string;
  clientId?: string;
  lastMileage?: number;
  lastMileageAt?: string;
  createdAt: string;
}

export interface MileageLog {
  id: string;
  vehicleId: string;
  mileage: number;
  recordedAt: string;
  workOrderId?: string;
  notes?: string;
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

export function useMileageLogs(vehicleId: string) {
  return useQuery<MileageLog[]>({
    queryKey: ["vehicles", vehicleId, "mileage"],
    queryFn: () => api.get(`/vehicles/${vehicleId}/mileage`).then((r) => r.data),
    enabled: !!vehicleId,
  });
}

export function useAddMileageLog(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { mileage: number; recordedAt: string; notes?: string }) =>
      api.post(`/vehicles/${vehicleId}/mileage`, data).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles", vehicleId, "mileage"] });
    },
  });
}

export function useDeleteMileageLog(vehicleId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (logId: string) =>
      api.delete(`/vehicles/${vehicleId}/mileage/${logId}`).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["vehicles", vehicleId, "mileage"] });
    },
  });
}
