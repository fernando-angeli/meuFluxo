import type { HttpQueryValue } from "./query-params";
import { applyQueryRecord } from "./query-params";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpError = {
  status: number;
  message: string;
  details?: unknown;
};

export type HttpClientOptions = {
  baseUrl: string;
  getAuthToken?: () => string | null | undefined;
  /** Chamado quando a API retorna 401. Deve tentar refresh e retornar novo token; se falhar retorna null. */
  on401Retry?: () => Promise<string | null>;
  /** Chamado quando 401 e on401Retry retornou null ou não existe. */
  onUnauthorized?: () => void;
  defaultHeaders?: Record<string, string>;
};

const REFRESH_PATH = "/auth/refresh";

/** 401 em login não é "sessão expirada" — não deve tentar refresh nem logout global. */
const AUTH_PATHS_SKIP_UNAUTHORIZED_HANDLER = new Set<string>(["/auth/login", "/auth/logout"]);

function normalizePath(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

function errorMessageFromPayload(
  payload: unknown,
  statusText: string,
): string {
  if (typeof payload === "string" && payload.trim()) {
    return payload.trim().slice(0, 500);
  }
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.detail === "string" && p.detail.trim()) return p.detail;
    if (typeof p.message === "string" && p.message.trim()) return p.message;
    if (typeof p.title === "string" && p.title.trim()) return p.title;
  }
  return statusText || "Erro de requisição";
}

export class HttpClient {
  private baseUrl: string;
  private getAuthToken?: () => string | null | undefined;
  private on401Retry?: () => Promise<string | null>;
  private onUnauthorized?: () => void;
  private defaultHeaders?: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.getAuthToken = options.getAuthToken;
    this.on401Retry = options.on401Retry;
    this.onUnauthorized = options.onUnauthorized;
    this.defaultHeaders = options.defaultHeaders;
  }

  private async doRequest<TResponse>(
    path: string,
    init: {
      method: HttpMethod;
      query?: Record<string, HttpQueryValue>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    },
    token: string | null | undefined,
  ): Promise<{ response: TResponse; status: number }> {
    const normalizedPath = normalizePath(path);
    const url = new URL(this.baseUrl + normalizedPath);
    if (init.query) {
      applyQueryRecord(url, init.query);
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.defaultHeaders,
      ...init.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    let res: Response;
    try {
      res = await fetch(url, {
        method: init.method,
        headers,
        body: init.body === undefined ? undefined : JSON.stringify(init.body),
        signal: init.signal,
        credentials: "include",
      });
    } catch (e) {
      const isNetworkError =
        e instanceof TypeError &&
        (e.message === "Failed to fetch" ||
          e.message === "Load failed" ||
          e.message === "NetworkError when attempting to fetch resource");
      throw {
        status: 0,
        message: isNetworkError
          ? "Falha na conexão com o servidor."
          : e instanceof Error ? e.message : "Erro de conexão",
        details: e,
      } as HttpError;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const isJson = contentType.includes("application/json");
    const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

    if (!res.ok) {
      const err: HttpError = {
        status: res.status,
        message: errorMessageFromPayload(payload, res.statusText || ""),
        details: payload ?? undefined,
      };
      throw err;
    }

    return { response: payload as TResponse, status: res.status };
  }

  async request<TResponse>(
    path: string,
    init: {
      method: HttpMethod;
      query?: Record<string, HttpQueryValue>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    },
    isRetry = false,
  ): Promise<TResponse> {
    const normalizedPath = normalizePath(path);
    const token = this.getAuthToken?.();

    try {
      const { response } = await this.doRequest<TResponse>(normalizedPath, init, token);
      return response;
    } catch (e) {
      const err = e as HttpError;
      const status = err?.status ?? 0;
      const skipUnauthorizedHandler = AUTH_PATHS_SKIP_UNAUTHORIZED_HANDLER.has(normalizedPath);

      if (
        status === 401 &&
        this.on401Retry &&
        !isRetry &&
        normalizedPath !== REFRESH_PATH &&
        !skipUnauthorizedHandler
      ) {
        const newToken = await this.on401Retry();
        if (newToken) {
          return this.request<TResponse>(normalizedPath, init, true);
        }
        this.onUnauthorized?.();
      } else if ((status === 401 || status === 403) && !isRetry && !skipUnauthorizedHandler) {
        this.onUnauthorized?.();
      }

      throw e;
    }
  }
}

