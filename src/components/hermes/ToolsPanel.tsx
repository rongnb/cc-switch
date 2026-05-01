import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Save, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { useHermesTools, useSaveHermesTools } from "@/hooks/useHermes";
import { extractErrorMessage } from "@/utils/errorUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { HermesToolsConfig, HermesToolsProfile } from "@/types";
import {
  getHermesToolsProfileSelectValue,
  getHermesUnsupportedProfile,
  HERMES_TOOL_PROFILES,
  HERMES_UNSET_PROFILE,
  HERMES_UNSUPPORTED_PROFILE,
} from "./utils";

interface ListItem {
  id: string;
  value: string;
}

const ToolsPanel: React.FC = () => {
  const { t } = useTranslation();
  const { data: toolsData, isLoading } = useHermesTools();
  const saveToolsMutation = useSaveHermesTools();
  const [config, setConfig] = useState<HermesToolsConfig>({});
  const [allowList, setAllowList] = useState<ListItem[]>([]);
  const [denyList, setDenyList] = useState<ListItem[]>([]);

  useEffect(() => {
    if (toolsData) {
      setConfig(toolsData);
      setAllowList(
        (toolsData.allow ?? []).map((value) => ({
          id: crypto.randomUUID(),
          value,
        })),
      );
      setDenyList(
        (toolsData.deny ?? []).map((value) => ({
          id: crypto.randomUUID(),
          value,
        })),
      );
    }
  }, [toolsData]);

  const unsupportedProfile = getHermesUnsupportedProfile(config.profile);

  const profileLabels = useMemo<Record<HermesToolsProfile, string>>(
    () => ({
      minimal: t("hermes.tools.profileMinimal", {
        defaultValue: "Minimal",
      }),
      coding: t("hermes.tools.profileCoding", {
        defaultValue: "Coding",
      }),
      messaging: t("hermes.tools.profileMessaging", {
        defaultValue: "Messaging",
      }),
      full: t("hermes.tools.profileFull", {
        defaultValue: "Full",
      }),
    }),
    [t],
  );

  const handleSave = async () => {
    try {
      const { profile, allow, deny, ...other } = config;
      const newConfig: HermesToolsConfig = {
        ...other,
        profile,
        allow: allowList.map((item) => item.value).filter((s) => s.trim()),
        deny: denyList.map((item) => item.value).filter((s) => s.trim()),
      };

      await saveToolsMutation.mutateAsync(newConfig);
      toast.success(t("hermes.tools.saveSuccess"));
    } catch (error) {
      const detail = extractErrorMessage(error);
      toast.error(t("hermes.tools.saveFailed"), {
        description: detail || undefined,
      });
    }
  };

  const updateListItem = (
    setList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    index: number,
    value: string,
  ) => {
    setList((prev) =>
      prev.map((item, i) => (i === index ? { ...item, value } : item)),
    );
  };

  const removeListItem = (
    setList: React.Dispatch<React.SetStateAction<ListItem[]>>,
    index: number,
  ) => {
    setList((prev) => prev.filter((_, i) => i !== index));
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
      <p className="text-sm text-muted-foreground mb-6">
        {t("hermes.tools.description")}
      </p>

      {unsupportedProfile && (
        <Alert className="mb-6 border-amber-500/30 bg-amber-500/5">
          <TriangleAlert className="h-4 w-4" />
          <AlertTitle>
            {t("hermes.tools.unsupportedProfileTitle", {
              defaultValue: "Unsupported tools profile",
            })}
          </AlertTitle>
          <AlertDescription>
            {t("hermes.tools.unsupportedProfileDescription", {
              value: unsupportedProfile,
              defaultValue:
                "The current tools.profile value '{{value}}' is not in the supported Hermes list. It will be preserved until you choose a new value.",
            })}
          </AlertDescription>
        </Alert>
      )}

      <div className="mb-6">
        <Label className="mb-2 block">{t("hermes.tools.profile")}</Label>
        <Select
          value={getHermesToolsProfileSelectValue(config.profile)}
          onValueChange={(value) => {
            if (value === HERMES_UNSUPPORTED_PROFILE) return;
            if (value === HERMES_UNSET_PROFILE) {
              setConfig((prev) => ({ ...prev, profile: undefined }));
              return;
            }
            setConfig((prev) => ({ ...prev, profile: value }));
          }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={HERMES_UNSET_PROFILE}>
              {t("hermes.tools.profileUnset", {
                defaultValue: "Not set",
              })}
            </SelectItem>
            {unsupportedProfile && (
              <SelectItem
                value={HERMES_UNSUPPORTED_PROFILE}
                disabled={true}
              >{`${unsupportedProfile} (${t(
                "hermes.tools.unsupportedProfileLabel",
                {
                  defaultValue: "unsupported",
                },
              )})`}</SelectItem>
            )}
            {HERMES_TOOL_PROFILES.map((profile) => (
              <SelectItem key={profile} value={profile}>
                {profileLabels[profile]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-6">
        <Label className="mb-2 block">{t("hermes.tools.allowList")}</Label>
        <div className="space-y-2">
          {allowList.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                value={item.value}
                onChange={(e) =>
                  updateListItem(setAllowList, index, e.target.value)
                }
                placeholder={t("hermes.tools.patternPlaceholder")}
                className="font-mono text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeListItem(setAllowList, index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setAllowList((prev) => [
                ...prev,
                { id: crypto.randomUUID(), value: "" },
              ])
            }
          >
            <Plus className="w-4 h-4 mr-1" />
            {t("hermes.tools.addAllow")}
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Label className="mb-2 block">{t("hermes.tools.denyList")}</Label>
        <div className="space-y-2">
          {denyList.map((item, index) => (
            <div key={item.id} className="flex items-center gap-2">
              <Input
                value={item.value}
                onChange={(e) =>
                  updateListItem(setDenyList, index, e.target.value)
                }
                placeholder={t("hermes.tools.patternPlaceholder")}
                className="font-mono text-xs"
              />
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 h-9 w-9 text-muted-foreground hover:text-destructive"
                onClick={() => removeListItem(setDenyList, index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setDenyList((prev) => [
                ...prev,
                { id: crypto.randomUUID(), value: "" },
              ])
            }
          >
            <Plus className="w-4 h-4 mr-1" />
            {t("hermes.tools.addDeny")}
          </Button>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          size="sm"
          onClick={handleSave}
          disabled={saveToolsMutation.isPending}
        >
          <Save className="w-4 h-4 mr-1" />
          {saveToolsMutation.isPending ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
};

export default ToolsPanel;
