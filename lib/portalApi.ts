"use client";

import useSWR from "swr";
import type { PortalMe } from "@/types/portal";

export class PortalApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** Customer-portal API client: cookie-authenticated, never uses the business session. */
const request = async <T = any>(method: string, url: string, body?: unknown): Promise<T> => {
  const res = await fetch(`/api/portal${url}`, {
    method,
    credentials: "same-origin",
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) throw new PortalApiError(data?.message || "Something went wrong", res.status);
  return data as T;
};

export const portalGet = <T = any>(url: string) => request<T>("GET", url);
export const portalSend = <T = any>(method: "POST" | "PUT" | "DELETE", url: string, body?: unknown) =>
  request<T>(method, url, body ?? {});

export const errorText = (err: unknown, fallback = "Something went wrong") =>
  err instanceof Error && err.message ? err.message : fallback;

/** SWR wrapper for portal GET endpoints; pass null to skip. */
export const usePortalQuery = <T = any>(url: string | null) => {
  const { data, error, isLoading, mutate } = useSWR<T, PortalApiError>(
    url ? `portal:${url}` : null,
    () => portalGet<T>(url as string),
    { revalidateOnFocus: false, shouldRetryOnError: false },
  );
  return { data, error, loading: isLoading, refresh: () => mutate() };
};

export const usePortalMe = () => {
  const { data, error, loading, refresh } = usePortalQuery<PortalMe>("/auth/me");
  return { me: data ?? null, unauthorized: error?.status === 401, error, loading, refresh };
};
