import type {
  HermesAgentsDefaults,
  HermesEnvConfig,
  HermesToolsProfile,
} from "@/types";

export const HERMES_TOOL_PROFILES: HermesToolsProfile[] = [
  "minimal",
  "coding",
  "messaging",
  "full",
];

export const HERMES_UNSUPPORTED_PROFILE = "__unsupported_profile__";
export const HERMES_UNSET_PROFILE = "__unset_profile__";

export function parseHermesEnvEditorValue(raw: string): HermesEnvConfig {
  if (!raw.trim()) {
    throw new Error("HERMES_ENV_EMPTY");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("HERMES_ENV_INVALID_JSON");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("HERMES_ENV_OBJECT_REQUIRED");
  }
  return parsed as HermesEnvConfig;
}

export function isHermesToolsProfile(
  profile?: string,
): profile is HermesToolsProfile {
  return (
    typeof profile === "string" &&
    HERMES_TOOL_PROFILES.includes(profile as HermesToolsProfile)
  );
}

export function getHermesToolsProfileSelectValue(profile?: string): string {
  if (!profile) {
    return HERMES_UNSET_PROFILE;
  }
  return isHermesToolsProfile(profile)
    ? profile
    : HERMES_UNSUPPORTED_PROFILE;
}

export function getHermesUnsupportedProfile(profile?: string): string | null {
  if (!profile || isHermesToolsProfile(profile)) {
    return null;
  }
  return profile;
}

export function getHermesTimeoutInputValue(
  defaults?: HermesAgentsDefaults | null,
): string {
  const timeoutSeconds =
    typeof defaults?.timeoutSeconds === "number"
      ? defaults.timeoutSeconds
      : undefined;
  const legacyTimeout =
    typeof defaults?.timeout === "number" ? defaults.timeout : undefined;
  const value = timeoutSeconds ?? legacyTimeout;
  return value === undefined ? "" : String(value);
}
