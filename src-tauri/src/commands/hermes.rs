use std::collections::HashMap;
use tauri::State;

use crate::hermes_config;
use crate::store::AppState;

// ============================================================================
// Hermes Provider Commands (migrated from provider.rs)
// ============================================================================

/// Import providers from Hermes live config to database.
///
/// Hermes uses additive mode — users may already have providers
/// configured in hermes.json.
#[tauri::command]
pub fn import_hermes_providers_from_live(state: State<'_, AppState>) -> Result<usize, String> {
    crate::services::provider::import_hermes_providers_from_live(state.inner())
        .map_err(|e| e.to_string())
}

/// Get provider IDs in the Hermes live config.
#[tauri::command]
pub fn get_hermes_live_provider_ids() -> Result<Vec<String>, String> {
    hermes_config::get_providers()
        .map(|providers| providers.keys().cloned().collect())
        .map_err(|e| e.to_string())
}

/// Get a single Hermes provider fragment from live config.
#[tauri::command]
pub fn get_hermes_live_provider(
    #[allow(non_snake_case)] providerId: String,
) -> Result<Option<serde_json::Value>, String> {
    hermes_config::get_provider(&providerId).map_err(|e| e.to_string())
}

/// Scan hermes.json for known configuration hazards.
#[tauri::command]
pub fn scan_hermes_config_health() -> Result<Vec<hermes_config::HermesHealthWarning>, String>
{
    hermes_config::scan_hermes_config_health().map_err(|e| e.to_string())
}

// ============================================================================
// Agents Configuration Commands
// ============================================================================

/// Get Hermes default model config (agents.defaults.model)
#[tauri::command]
pub fn get_hermes_default_model() -> Result<Option<hermes_config::HermesDefaultModel>, String>
{
    hermes_config::get_default_model().map_err(|e| e.to_string())
}

/// Set Hermes default model config (agents.defaults.model)
#[tauri::command]
pub fn set_hermes_default_model(
    model: hermes_config::HermesDefaultModel,
) -> Result<hermes_config::HermesWriteOutcome, String> {
    hermes_config::set_default_model(&model).map_err(|e| e.to_string())
}

/// Get Hermes model catalog/allowlist (agents.defaults.models)
#[tauri::command]
pub fn get_hermes_model_catalog(
) -> Result<Option<HashMap<String, hermes_config::HermesModelCatalogEntry>>, String> {
    hermes_config::get_model_catalog().map_err(|e| e.to_string())
}

/// Set Hermes model catalog/allowlist (agents.defaults.models)
#[tauri::command]
pub fn set_hermes_model_catalog(
    catalog: HashMap<String, hermes_config::HermesModelCatalogEntry>,
) -> Result<hermes_config::HermesWriteOutcome, String> {
    hermes_config::set_model_catalog(&catalog).map_err(|e| e.to_string())
}

/// Get full agents.defaults config (all fields)
#[tauri::command]
pub fn get_hermes_agents_defaults(
) -> Result<Option<hermes_config::HermesAgentsDefaults>, String> {
    hermes_config::get_agents_defaults().map_err(|e| e.to_string())
}

/// Set full agents.defaults config (all fields)
#[tauri::command]
pub fn set_hermes_agents_defaults(
    defaults: hermes_config::HermesAgentsDefaults,
) -> Result<hermes_config::HermesWriteOutcome, String> {
    hermes_config::set_agents_defaults(&defaults).map_err(|e| e.to_string())
}

// ============================================================================
// Env Configuration Commands
// ============================================================================

/// Get Hermes env config (env section of hermes.json)
#[tauri::command]
pub fn get_hermes_env() -> Result<hermes_config::HermesEnvConfig, String> {
    hermes_config::get_env_config().map_err(|e| e.to_string())
}

/// Set Hermes env config (env section of hermes.json)
#[tauri::command]
pub fn set_hermes_env(
    env: hermes_config::HermesEnvConfig,
) -> Result<hermes_config::HermesWriteOutcome, String> {
    hermes_config::set_env_config(&env).map_err(|e| e.to_string())
}

// ============================================================================
// Tools Configuration Commands
// ============================================================================

/// Get Hermes tools config (tools section of hermes.json)
#[tauri::command]
pub fn get_hermes_tools() -> Result<hermes_config::HermesToolsConfig, String> {
    hermes_config::get_tools_config().map_err(|e| e.to_string())
}

/// Set Hermes tools config (tools section of hermes.json)
#[tauri::command]
pub fn set_hermes_tools(
    tools: hermes_config::HermesToolsConfig,
) -> Result<hermes_config::HermesWriteOutcome, String> {
    hermes_config::set_tools_config(&tools).map_err(|e| e.to_string())
}
