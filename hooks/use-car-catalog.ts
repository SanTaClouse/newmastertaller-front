import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export interface CarBrand { id: string; name: string; }
export interface CarModel { id: string; brandId: string; name: string; }

export function useCarBrands() {
  return useQuery<CarBrand[]>({
    queryKey: ["car-brands"],
    queryFn: () => api.get("/car-brands").then((r) => r.data),
    staleTime: Infinity,
  });
}

export function useCarModels(brandId?: string) {
  return useQuery<CarModel[]>({
    queryKey: ["car-models", brandId],
    queryFn: () => api.get(`/car-brands/${brandId}/models`).then((r) => r.data),
    enabled: !!brandId,
    staleTime: Infinity,
  });
}
