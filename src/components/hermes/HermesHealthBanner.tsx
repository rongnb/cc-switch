import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TriangleAlert } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { HermesHealthWarning } from "@/types";

interface HermesHealthBannerProps {
  warnings: HermesHealthWarning[];
}

function getWarningText(
  code: string,
  fallback: string,
  t: ReturnType<typeof useTranslation>["t"],
) {
  switch (code) {
    case "invalid_tools_profile":
      return t("hermes.health.invalidToolsProfile", {
        defaultValue:
          "tools.profile contains an unsupported value. Hermes currently expects minimal, coding, messaging, or full.",
      });
    case "legacy_agents_timeout":
      return t("hermes.health.legacyTimeout", {
        defaultValue:
          "agents.defaults.timeout is deprecated. Save the Agents panel to migrate it to timeoutSeconds.",
      });
    case "stringified_env_vars":
      return t("hermes.health.stringifiedEnvVars", {
        defaultValue:
          "env.vars should be an object, but the current value looks stringified or malformed.",
      });
    case "stringified_env_shell_env":
      return t("hermes.health.stringifiedShellEnv", {
        defaultValue:
          "env.shellEnv should be an object, but the current value looks stringified or malformed.",
      });
    case "config_parse_failed":
      return t("hermes.health.parseFailed", {
        defaultValue:
          "hermes.json could not be parsed as valid JSON5. Fix the file before editing it here.",
      });
    default:
      return fallback;
  }
}

const HermesHealthBanner: React.FC<HermesHealthBannerProps> = ({
  warnings,
}) => {
  const { t } = useTranslation();

  const items = useMemo(
    () =>
      warnings.map((warning) => ({
        ...warning,
        text: getWarningText(warning.code, warning.message, t),
      })),
    [t, warnings],
  );

  if (warnings.length === 0) {
    return null;
  }

  return (
    <div className="px-6 pt-4">
      <Alert className="border-amber-500/30 bg-amber-500/5">
        <TriangleAlert className="h-4 w-4" />
        <AlertTitle>
          {t("hermes.health.title", {
            defaultValue: "Hermes config warnings detected",
          })}
        </AlertTitle>
        <AlertDescription>
          <ul className="list-disc space-y-1 pl-5">
            {items.map((warning) => (
              <li key={`${warning.code}:${warning.path ?? warning.message}`}>
                {warning.text}
                {warning.path ? ` (${warning.path})` : ""}
              </li>
            ))}
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default HermesHealthBanner;
