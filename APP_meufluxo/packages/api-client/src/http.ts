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
      query?: Record<string, string | number | boolean | null | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    },
    token: string | null | undefined,
  ): Promise<{ response: TResponse; status: number }> {
    const url = new URL(this.baseUrl + path);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v === null || v === undefined) continue;
        url.searchParams.set(k, String(v));
      }
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
          ? "Não foi possível conectar ao servidor. Verifique se o backend está rodando e a URL (NEXT_PUBLIC_API_URL)."
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
        message:
          (payload && typeof payload === "object" && "message" in payload && String((payload as any).message)) ||
          res.statusText ||
          "Erro de requisição",
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
      query?: Record<string, string | number | boolean | null | undefined>;
      body?: unknown;
      headers?: Record<string, string>;
      signal?: AbortSignal;
    },
    isRetry = false,
  ): Promise<TResponse> {
    const token = this.getAuthToken?.();

    try {
      const { response } = await this.doRequest<TResponse>(path, init, token);
      return response;
    } catch (e) {
      const err = e as HttpError;
      const status = err?.status ?? 0;

      if (status === 401 && this.on401Retry && !isRetry && path !== REFRESH_PATH) {
        const newToken = await this.on401Retry();
        if (newToken) {
          return this.request<TResponse>(path, init, true);
        }
        this.onUnauthorized?.();
      } else if ((status === 401 || status === 403) && !isRetry) {
        this.onUnauthorized?.();
      }

      throw e;
    }
  }
}

