import { useState, useCallback, useMemo } from "react";
import type { HermesModel, HermesProviderConfig } from "@/types";
import type { AppId } from "@/lib/api";
import { useProvidersQuery } from "@/lib/query/queries";
import { HERMES_DEFAULT_CONFIG } from "../helpers/opencodeFormUtils";

interface UseHermesFormStateParams {
  initialData?: {
    settingsConfig?: Record<string, unknown>;
  };
  appId: AppId;
  providerId?: string;
  onSettingsConfigChange: (config: string) => void;
  getSettingsConfig: () => string;
}

export const HERMES_DEFAULT_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0";

export interface HermesFormState {
  hermesProviderKey: string;
  setHermesProviderKey: (key: string) => void;
  hermesBaseUrl: string;
  hermesApiKey: string;
  hermesApi: string;
  hermesModels: HermesModel[];
  hermesUserAgent: boolean;
  existingHermesKeys: string[];
  handleHermesBaseUrlChange: (baseUrl: string) => void;
  handleHermesApiKeyChange: (apiKey: string) => void;
  handleHermesApiChange: (api: string) => void;
  handleHermesModelsChange: (models: HermesModel[]) => void;
  handleHermesUserAgentChange: (enabled: boolean) => void;
  resetHermesState: (config?: HermesProviderConfig) => void;
}

function parseHermesField<T>(
  initialData: UseHermesFormStateParams["initialData"],
  field: string,
  fallback: T,
): T {
  try {
    const config = JSON.parse(
      initialData?.settingsConfig
        ? JSON.stringify(initialData.settingsConfig)
        : HERMES_DEFAULT_CONFIG,
    );
    return (config[field] as T) || fallback;
  } catch {
    return fallback;
  }
}

export function useHermesFormState({
  initialData,
  appId,
  providerId,
  onSettingsConfigChange,
  getSettingsConfig,
}: UseHermesFormStateParams): HermesFormState {
  // Query existing providers for duplicate key checking
  const { data: hermesProvidersData } = useProvidersQuery("hermes");
  const existingHermesKeys = useMemo(() => {
    if (!hermesProvidersData?.providers) return [];
    return Object.keys(hermesProvidersData.providers).filter(
      (k) => k !== providerId,
    );
  }, [hermesProvidersData?.providers, providerId]);

  const [hermesProviderKey, setHermesProviderKey] = useState<string>(() => {
    if (appId !== "hermes") return "";
    return providerId || "";
  });

  const [hermesBaseUrl, setHermesBaseUrl] = useState<string>(() => {
    if (appId !== "hermes") return "";
    return parseHermesField(initialData, "baseUrl", "");
  });

  const [hermesApiKey, setHermesApiKey] = useState<string>(() => {
    if (appId !== "hermes") return "";
    return parseHermesField(initialData, "apiKey", "");
  });

  const [hermesApi, setHermesApi] = useState<string>(() => {
    if (appId !== "hermes") return "openai-completions";
    return parseHermesField(initialData, "api", "openai-completions");
  });

  const [hermesModels, setHermesModels] = useState<HermesModel[]>(() => {
    if (appId !== "hermes") return [];
    return parseHermesField<HermesModel[]>(initialData, "models", []);
  });

  const [hermesUserAgent, setHermesUserAgent] = useState<boolean>(() => {
    if (appId !== "hermes") return true;
    const headers = parseHermesField<Record<string, string>>(
      initialData,
      "headers",
      {},
    );
    return "User-Agent" in headers;
  });

  const updateHermesConfig = useCallback(
    (updater: (config: Record<string, any>) => void) => {
      try {
        const config = JSON.parse(
          getSettingsConfig() || HERMES_DEFAULT_CONFIG,
        );
        updater(config);
        onSettingsConfigChange(JSON.stringify(config, null, 2));
      } catch {
        // ignore
      }
    },
    [getSettingsConfig, onSettingsConfigChange],
  );

  const handleHermesBaseUrlChange = useCallback(
    (baseUrl: string) => {
      setHermesBaseUrl(baseUrl);
      updateHermesConfig((config) => {
        config.baseUrl = baseUrl.trim().replace(/\/+$/, "");
      });
    },
    [updateHermesConfig],
  );

  const handleHermesApiKeyChange = useCallback(
    (apiKey: string) => {
      setHermesApiKey(apiKey);
      updateHermesConfig((config) => {
        config.apiKey = apiKey;
      });
    },
    [updateHermesConfig],
  );

  const handleHermesApiChange = useCallback(
    (api: string) => {
      setHermesApi(api);
      updateHermesConfig((config) => {
        config.api = api;
      });
    },
    [updateHermesConfig],
  );

  const handleHermesModelsChange = useCallback(
    (models: HermesModel[]) => {
      setHermesModels(models);
      updateHermesConfig((config) => {
        config.models = models;
      });
    },
    [updateHermesConfig],
  );

  const handleHermesUserAgentChange = useCallback(
    (enabled: boolean) => {
      setHermesUserAgent(enabled);
      updateHermesConfig((config) => {
        if (enabled) {
          config.headers = { "User-Agent": HERMES_DEFAULT_USER_AGENT };
        } else {
          delete config.headers;
        }
      });
    },
    [updateHermesConfig],
  );

  const resetHermesState = useCallback((config?: HermesProviderConfig) => {
    setHermesProviderKey("");
    setHermesBaseUrl(config?.baseUrl || "");
    setHermesApiKey(config?.apiKey || "");
    setHermesApi(config?.api || "openai-completions");
    setHermesModels(config?.models || []);
    const ua = config?.headers ? "User-Agent" in config.headers : false;
    setHermesUserAgent(ua);
  }, []);

  return {
    hermesProviderKey,
    setHermesProviderKey,
    hermesBaseUrl,
    hermesApiKey,
    hermesApi,
    hermesModels,
    hermesUserAgent,
    existingHermesKeys,
    handleHermesBaseUrlChange,
    handleHermesApiKeyChange,
    handleHermesApiChange,
    handleHermesModelsChange,
    handleHermesUserAgentChange,
    resetHermesState,
  };
}
