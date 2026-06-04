import { describe, expect, it } from "vitest";

import { resolveApiUrl } from "./api";

describe("resolveApiUrl", () => {
  it("uses the configured API base URL for absolute backend requests", () => {
    expect(resolveApiUrl("/v1/tasks", "https://api.example.com/")).toBe(
      "https://api.example.com/v1/tasks"
    );
  });

  it("keeps same-origin requests when no API base URL is configured", () => {
    expect(resolveApiUrl("/v1/tasks", "")).toBe("/v1/tasks");
  });
});
