const BASE_URL = import.meta.env.VITE_API_URL ?? "/api";

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

let getAccessToken: (() => string | null) | null = null;
let getRefreshToken: (() => string | null) | null = null;
let onRefresh: ((accessToken: string) => void) | null = null;
let onLogout: (() => void) | null = null;

export const configureFetchClient = (config: {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  onRefresh: (accessToken: string) => void;
  onLogout: () => void;
}) => {
  getAccessToken = config.getAccessToken;
  getRefreshToken = config.getRefreshToken;
  onRefresh = config.onRefresh;
  onLogout = config.onLogout;
};

const buildUrl = (path: string, params?: Record<string, string | number | boolean | undefined>): string => {
  const url = new URL(path, BASE_URL.startsWith("http") ? BASE_URL : window.location.origin);
  if (!path.startsWith("http")) {
    url.pathname = `${BASE_URL}${path}`;
  }
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    });
  }
  return url.toString();
};

let isRefreshing = false;
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = [];

const processRefreshQueue = (error: Error | null, token?: string) => {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error || !token) {
      reject(error ?? new Error("Token refresh failed"));
    } else {
      resolve(token);
    }
  });
  refreshQueue = [];
};

const doRefresh = async (): Promise<string> => {
  const refreshToken = getRefreshToken?.();
  if (!refreshToken) throw new Error("No refresh token");

  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!res.ok) {
    throw new Error("Refresh failed");
  }

  const json = await res.json();
  const newToken = json.data?.accessToken as string;
  if (!newToken) throw new Error("No access token in refresh response");

  onRefresh?.(newToken);
  return newToken;
};

export async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const { params, headers: customHeaders, ...rest } = options;

  const doFetch = async (token: string | null): Promise<Response> => {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(customHeaders as Record<string, string>),
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return fetch(buildUrl(path, params), {
      ...rest,
      headers,
    });
  };

  let token = getAccessToken?.() ?? null;
  let response = await doFetch(token);

  if (response.status === 401 && getRefreshToken?.()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await doRefresh();
        processRefreshQueue(null, newToken);
        token = newToken;
        response = await doFetch(token);
      } catch (err) {
        processRefreshQueue(err as Error);
        onLogout?.();
        throw err;
      } finally {
        isRefreshing = false;
      }
    } else {
      token = await new Promise<string>((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      response = await doFetch(token);
    }
  }

  if (!response.ok) {
    let errorMessage = `Error ${response.status}`;
    try {
      const errorBody = await response.json();
      errorMessage = errorBody.message || errorMessage;
    } catch {
      // ignore
    }
    const error = new Error(errorMessage) as Error & { status: number };
    error.status = response.status;
    throw error;
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export const api = {
  get: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),

  post: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(path: string, body?: unknown, options?: FetchOptions) =>
    apiFetch<T>(path, {
      ...options,
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(path: string, options?: FetchOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
