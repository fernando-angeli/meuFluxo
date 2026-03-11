export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type HttpError = {
  status: number;
  message: string;
  details?: unknown;
};

export type HttpClientOptions = {
  baseUrl: string;
  getAuthToken?: () => string | null | undefined;
  defaultHeaders?: Record<string, string>;
};

export class HttpClient {
  private baseUrl: string;
  private getAuthToken?: () => string | null | undefined;
  private defaultHeaders?: Record<string, string>;

  constructor(options: HttpClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, "");
    this.getAuthToken = options.getAuthToken;
    this.defaultHeaders = options.defaultHeaders;
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
  ): Promise<TResponse> {
    const url = new URL(this.baseUrl + path);
    if (init.query) {
      for (const [k, v] of Object.entries(init.query)) {
        if (v === null || v === undefined) continue;
        url.searchParams.set(k, String(v));
      }
    }

    const token = this.getAuthToken?.();
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

    return payload as TResponse;
  }
}

