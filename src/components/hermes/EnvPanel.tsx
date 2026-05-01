import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useHermesEnv, useSaveHermesEnv } from "@/hooks/useHermes";
import { extractErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import JsonEditor from "@/components/JsonEditor";
import { parseHermesEnvEditorValue } from "./utils";

const EnvPanel: React.FC = () => {
  const { t } = useTranslation();
  const { data: envData, isLoading } = useHermesEnv();
  const saveEnvMutation = useSaveHermesEnv();
  const [editorValue, setEditorValue] = useState("{}");
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const nextValue =
      envData && Object.keys(envData).length > 0
        ? JSON.stringify(envData, null, 2)
        : "{}";
    setEditorValue(nextValue);
  }, [envData]);

  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));

    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const handleSave = async () => {
    try {
      const env = parseHermesEnvEditorValue(editorValue);
      await saveEnvMutation.mutateAsync(env);
      toast.success(t("hermes.env.saveSuccess"));
    } catch (error) {
      const detail = extractErrorMessage(error);
      let description = detail || undefined;
      if (detail === "HERMES_ENV_EMPTY") {
        description = t("hermes.env.empty", {
          defaultValue:
            "Hermes env cannot be empty. Use {} for an empty object.",
        });
      } else if (detail === "HERMES_ENV_INVALID_JSON") {
        description = t("hermes.env.invalidJson", {
          defaultValue: "Hermes env must be valid JSON.",
        });
      } else if (detail === "HERMES_ENV_OBJECT_REQUIRED") {
        description = t("hermes.env.objectRequired", {
          defaultValue: "Hermes env must be a JSON object.",
        });
      }
      toast.error(t("hermes.env.saveFailed"), {
        description,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 pt-4 pb-8 flex items-center justify-center min-h-[200px]">
        <div className="text-sm text-muted-foreground">
          {t("common.loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pt-4 pb-8">
      <p className="text-sm text-muted-foreground mb-4">
        {t("hermes.env.description")}
      </p>
      <p className="text-xs text-muted-foreground mb-4">
        {t("hermes.env.editorHint", {
          defaultValue:
            "Edit the full env section as JSON. Nested objects such as env.vars and env.shellEnv are supported.",
        })}
      </p>

      <JsonEditor
        value={editorValue}
        onChange={setEditorValue}
        darkMode={isDarkMode}
        rows={18}
        showValidation={true}
        language="json"
      />

      <div className="flex justify-end mt-4">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saveEnvMutation.isPending}
        >
          <Save className="w-4 h-4 mr-1" />
          {saveEnvMutation.isPending ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
};

export default EnvPanel;
