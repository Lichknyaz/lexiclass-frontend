export type ApiFetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

export interface ApiClientOptions {
  baseUrl?: string;
  fetcher?: ApiFetcher;
  getToken?: () => string | null;
}

export interface ApiRequestOptions<TBody = unknown> {
  body?: TBody;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  readonly status: number;
  readonly payload: unknown;

  constructor(
    message: string,
    status: number,
    payload: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

export interface ApiClient {
  get<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
  post<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse>;
  put<TResponse, TBody = unknown>(
    path: string,
    body: TBody,
    options?: ApiRequestOptions,
  ): Promise<TResponse>;
  delete<TResponse>(path: string, options?: ApiRequestOptions): Promise<TResponse>;
}

const DEFAULT_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

export function createApiClient({
  baseUrl = DEFAULT_BASE_URL,
  fetcher = fetch,
  getToken,
}: ApiClientOptions = {}): ApiClient {
  const request = async <TResponse, TBody = unknown>(
    method: string,
    path: string,
    options: ApiRequestOptions<TBody> = {},
  ) => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...options.headers,
    };
    const token = getToken?.();

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const init: RequestInit = {
      method,
      headers,
    };

    if (options.body !== undefined) {
      headers["Content-Type"] = "application/json";
      init.body = JSON.stringify(options.body);
    }

    const response = await fetcher(joinUrl(baseUrl, path), init);
    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      throw new ApiError(
        parseApiErrorMessage(payload),
        response.status,
        payload,
      );
    }

    return payload as TResponse;
  };

  return {
    get: (path, options) => request("GET", path, options),
    post: (path, body, options = {}) =>
      request("POST", path, { ...options, body }),
    put: (path, body, options = {}) => request("PUT", path, { ...options, body }),
    delete: (path, options) => request("DELETE", path, options),
  };
}

export function joinUrl(baseUrl: string, path: string) {
  return `${baseUrl.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export function parseApiErrorMessage(payload: unknown) {
  if (typeof payload === "string" && payload.trim()) {
    return payload;
  }

  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }

    if (Array.isArray(record.errors) && typeof record.errors[0] === "string") {
      return record.errors[0];
    }
  }

  return "Request failed";
}

async function parseResponsePayload(response: Response) {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text || null;
}
