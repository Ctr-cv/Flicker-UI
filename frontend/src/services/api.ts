import type { ApiResponse, SystemStatus } from "@/types";

const BASE_URL = "/api";

async function request<T>(
  path: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    return {
      success: false,
      data: null as unknown as T,
      error: `HTTP ${res.status}: ${res.statusText}`,
    };
  }

  return res.json();
}

/* ── Endpoints ─────────────────────────────────────────────── */

export const api = {
  /** Get system status including model state and modality info. */
  getStatus: () => request<SystemStatus>("/status"),

  /** Trigger model reload on the backend. */
  reloadModel: () => request<{ ok: boolean }>("/model/reload", { method: "POST" }),

  /** Update inference configuration. */
  updateConfig: (config: Record<string, unknown>) =>
    request<{ ok: boolean }>("/config", {
      method: "PUT",
      body: JSON.stringify(config),
    }),

  /** Health check. */
  health: () => request<{ status: string }>("/health"),
};
