import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { hermesApi } from "@/lib/api/hermes";
import { providersApi } from "@/lib/api/providers";
import type {
  HermesEnvConfig,
  HermesToolsConfig,
  HermesAgentsDefaults,
} from "@/types";

/**
 * Centralized query keys for all Hermes-related queries.
 * Import this from any file that needs to invalidate Hermes caches.
 */
export const hermesKeys = {
  all: ["hermes"] as const,
  liveProviderIds: ["hermes", "liveProviderIds"] as const,
  defaultModel: ["hermes", "defaultModel"] as const,
  env: ["hermes", "env"] as const,
  tools: ["hermes", "tools"] as const,
  agentsDefaults: ["hermes", "agentsDefaults"] as const,
  health: ["hermes", "health"] as const,
};

// ============================================================
// Query hooks
// ============================================================

/**
 * Query live provider IDs from hermes.json config.
 * Used by ProviderList to show "In Config" badge.
 */
export function useHermesLiveProviderIds(enabled: boolean) {
  return useQuery({
    queryKey: hermesKeys.liveProviderIds,
    queryFn: () => providersApi.getHermesLiveProviderIds(),
    enabled,
  });
}

/**
 * Query the default model from agents.defaults.model.
 * Used by ProviderList to show which provider is the default.
 */
export function useHermesDefaultModel(enabled: boolean) {
  return useQuery({
    queryKey: hermesKeys.defaultModel,
    queryFn: () => hermesApi.getDefaultModel(),
    enabled,
  });
}

/**
 * Query env section of hermes.json.
 */
export function useHermesEnv() {
  return useQuery({
    queryKey: hermesKeys.env,
    queryFn: () => hermesApi.getEnv(),
    staleTime: 30_000,
  });
}

/**
 * Query tools section of hermes.json.
 */
export function useHermesTools() {
  return useQuery({
    queryKey: hermesKeys.tools,
    queryFn: () => hermesApi.getTools(),
    staleTime: 30_000,
  });
}

/**
 * Query agents.defaults section of hermes.json.
 */
export function useHermesAgentsDefaults() {
  return useQuery({
    queryKey: hermesKeys.agentsDefaults,
    queryFn: () => hermesApi.getAgentsDefaults(),
    staleTime: 30_000,
  });
}

export function useHermesHealth(enabled: boolean) {
  return useQuery({
    queryKey: hermesKeys.health,
    queryFn: () => hermesApi.scanHealth(),
    staleTime: 30_000,
    enabled,
  });
}

// ============================================================
// Mutation hooks
// ============================================================

/**
 * Save env config. Invalidates env query on success.
 * Toast notifications are handled by the component.
 */
export function useSaveHermesEnv() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (env: HermesEnvConfig) => hermesApi.setEnv(env),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hermesKeys.env });
      queryClient.invalidateQueries({ queryKey: hermesKeys.health });
    },
  });
}

/**
 * Save tools config. Invalidates tools query on success.
 * Toast notifications are handled by the component.
 */
export function useSaveHermesTools() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tools: HermesToolsConfig) => hermesApi.setTools(tools),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hermesKeys.tools });
      queryClient.invalidateQueries({ queryKey: hermesKeys.health });
    },
  });
}

/**
 * Save agents.defaults config. Invalidates both agentsDefaults and defaultModel
 * queries on success (since changing agents.defaults may affect the default model).
 * Toast notifications are handled by the component.
 */
export function useSaveHermesAgentsDefaults() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (defaults: HermesAgentsDefaults) =>
      hermesApi.setAgentsDefaults(defaults),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hermesKeys.agentsDefaults });
      queryClient.invalidateQueries({ queryKey: hermesKeys.defaultModel });
      queryClient.invalidateQueries({ queryKey: hermesKeys.health });
    },
  });
}
