import { describe, expect, it } from "vitest";
import {
  getHermesTimeoutInputValue,
  getHermesToolsProfileSelectValue,
  getHermesUnsupportedProfile,
  HERMES_UNSUPPORTED_PROFILE,
  parseHermesEnvEditorValue,
} from "@/components/hermes/utils";

describe("Hermes utils", () => {
  it("parses nested env objects without stringifying them", () => {
    const env = parseHermesEnvEditorValue(`{
      "API_KEY": "secret",
      "vars": { "HTTP_PROXY": "http://127.0.0.1:8080" },
      "shellEnv": { "NODE_OPTIONS": "--max-old-space-size=4096" }
    }`);

    expect(env).toEqual({
      API_KEY: "secret",
      vars: { HTTP_PROXY: "http://127.0.0.1:8080" },
      shellEnv: { NODE_OPTIONS: "--max-old-space-size=4096" },
    });
  });

  it("rejects non-object env payloads", () => {
    expect(() => parseHermesEnvEditorValue(`["not", "an object"]`)).toThrow(
      "HERMES_ENV_OBJECT_REQUIRED",
    );
  });

  it("flags unsupported tools profiles without silently normalizing them", () => {
    expect(getHermesToolsProfileSelectValue("default")).toBe(
      HERMES_UNSUPPORTED_PROFILE,
    );
    expect(getHermesUnsupportedProfile("default")).toBe("default");
    expect(getHermesUnsupportedProfile("coding")).toBeNull();
  });

  it("prefers timeoutSeconds and falls back to legacy timeout", () => {
    expect(
      getHermesTimeoutInputValue({ timeoutSeconds: 120, timeout: 30 }),
    ).toBe("120");
    expect(getHermesTimeoutInputValue({ timeout: 45 })).toBe("45");
    expect(getHermesTimeoutInputValue({})).toBe("");
  });
});
