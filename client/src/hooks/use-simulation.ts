import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";

// Define poll interval (1.5 seconds for tactical updates)
const POLL_INTERVAL = 1500;

export function useSimulationState(pollingEnabled: boolean = true) {
  return useQuery({
    queryKey: [api.simulation.getState.path],
    queryFn: async () => {
      const res = await fetch(api.simulation.getState.path);
      if (!res.ok) throw new Error("Failed to fetch simulation state");
      return api.simulation.getState.responses[200].parse(await res.json());
    },
    refetchInterval: pollingEnabled ? POLL_INTERVAL : false,
  });
}

export function useStartSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.simulation.start.path, { method: "POST" });
      if (!res.ok) throw new Error("Failed to start simulation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.simulation.getState.path] });
    },
  });
}

export function useStopSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.simulation.stop.path, { method: "POST" });
      if (!res.ok) throw new Error("Failed to stop simulation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.simulation.getState.path] });
    },
  });
}

export function useResetSimulation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.simulation.reset.path, { method: "POST" });
      if (!res.ok) throw new Error("Failed to reset simulation");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.simulation.getState.path] });
    },
  });
}

export function useNextTurn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.simulation.nextTurn.path, { method: "POST" });
      if (!res.ok) throw new Error("Failed to advance turn");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.simulation.getState.path] });
    },
  });
}
