import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertTour } from "@shared/schema";

export function useTours() {
  return useQuery({
    queryKey: [api.tours.list.path],
    queryFn: async () => {
      const res = await fetch(api.tours.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch tours");
      return api.tours.list.responses[200].parse(await res.json());
    },
  });
}

export function useTour(id: number) {
  return useQuery({
    queryKey: [api.tours.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.tours.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch tour");
      return api.tours.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateTour() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertTour) => {
      // Ensure numeric fields are numbers
      const payload = {
        ...data,
        basePrice: Number(data.basePrice),
        durationDays: Number(data.durationDays),
        capacity: Number(data.capacity),
      };
      
      const validated = api.tours.create.input.parse(payload);
      const res = await fetch(api.tours.create.path, {
        method: api.tours.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.tours.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create tour");
      }
      return api.tours.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.tours.list.path] });
    },
  });
}
