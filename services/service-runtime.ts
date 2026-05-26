import {
  AUTH_STORAGE_KEY,
  parseStoredSession,
} from "../features/auth/auth-session.ts";
import { createApiClient, type ApiClient } from "./api-client.ts";
import type { AuthStorage } from "./auth-service.ts";

export type DataSource = "mock" | "backend";

export const DEFAULT_API_URL = "http://localhost:4000/api/v1";
export const DEFAULT_DATA_SOURCE: DataSource = "mock";

export function getDataSource(): DataSource {
  return process.env.NEXT_PUBLIC_DATA_SOURCE === "backend"
    ? "backend"
    : DEFAULT_DATA_SOURCE;
}

export function isBackendMode() {
  return getDataSource() === "backend";
}

export function getApiBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

export function getStoredAccessToken(storage = getBrowserStorage()) {
  if (!storage) {
    return null;
  }

  const storedValue = storage.getItem(AUTH_STORAGE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    return parseStoredSession(JSON.parse(storedValue))?.accessToken ?? null;
  } catch {
    storage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function createRuntimeApiClient({
  storage,
}: {
  storage?: AuthStorage | null;
} = {}): ApiClient {
  return createApiClient({
    baseUrl: getApiBaseUrl(),
    getToken: () => getStoredAccessToken(storage ?? getBrowserStorage()),
  });
}

export const apiClient = createRuntimeApiClient();

function getBrowserStorage(): AuthStorage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}
