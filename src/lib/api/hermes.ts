import { invoke } from "@tauri-apps/api/core";
import type {
  HermesDefaultModel,
  HermesModelCatalogEntry,
  HermesAgentsDefaults,
  HermesEnvConfig,
  HermesToolsConfig,
  HermesHealthWarning,
  HermesWriteOutcome,
} from "@/types";

/**
 * Hermes configuration API
 *
 * Manages ~/.hermes/hermes.json sections:
 * - agents.defaults (model, catalog)
 * - env (environment variables)
 * - tools (permissions)
 */
export const hermesApi = {
  // ============================================================
  // Agents Configuration
  // ============================================================

  /**
   * Get default model configuration (agents.defaults.model)
   */
  async getDefaultModel(): Promise<HermesDefaultModel | null> {
    return await invoke("get_hermes_default_model");
  },

  /**
   * Set default model configuration (agents.defaults.model)
   */
  async setDefaultModel(
    model: HermesDefaultModel,
  ): Promise<HermesWriteOutcome> {
    return await invoke("set_hermes_default_model", { model });
  },

  /**
   * Get model catalog/allowlist (agents.defaults.models)
   */
  async getModelCatalog(): Promise<Record<
    string,
    HermesModelCatalogEntry
  > | null> {
    return await invoke("get_hermes_model_catalog");
  },

  /**
   * Set model catalog/allowlist (agents.defaults.models)
   */
  async setModelCatalog(
    catalog: Record<string, HermesModelCatalogEntry>,
  ): Promise<HermesWriteOutcome> {
    return await invoke("set_hermes_model_catalog", { catalog });
  },

  /**
   * Get full agents.defaults config (all fields)
   */
  async getAgentsDefaults(): Promise<HermesAgentsDefaults | null> {
    return await invoke("get_hermes_agents_defaults");
  },

  /**
   * Set full agents.defaults config (all fields)
   */
  async setAgentsDefaults(
    defaults: HermesAgentsDefaults,
  ): Promise<HermesWriteOutcome> {
    return await invoke("set_hermes_agents_defaults", { defaults });
  },

  // ============================================================
  // Env Configuration
  // ============================================================

  /**
   * Get env config (env section of hermes.json)
   */
  async getEnv(): Promise<HermesEnvConfig> {
    return await invoke("get_hermes_env");
  },

  /**
   * Set env config (env section of hermes.json)
   */
  async setEnv(env: HermesEnvConfig): Promise<HermesWriteOutcome> {
    return await invoke("set_hermes_env", { env });
  },

  // ============================================================
  // Tools Configuration
  // ============================================================

  /**
   * Get tools config (tools section of hermes.json)
   */
  async getTools(): Promise<HermesToolsConfig> {
    return await invoke("get_hermes_tools");
  },

  /**
   * Set tools config (tools section of hermes.json)
   */
  async setTools(tools: HermesToolsConfig): Promise<HermesWriteOutcome> {
    return await invoke("set_hermes_tools", { tools });
  },

  async scanHealth(): Promise<HermesHealthWarning[]> {
    return await invoke("scan_hermes_config_health");
  },

  async getLiveProvider(
    providerId: string,
  ): Promise<Record<string, unknown> | null> {
    return await invoke("get_hermes_live_provider", { providerId });
  },
};
