### Arquitectura API (`src/api`)

#### Visión general
- **client**: Wrapper de fetch nativo con `baseURL` desde `EXPO_PUBLIC_API_URL`, interceptores, manejo de token (`setAuthToken`/`clearAuthToken`) y helpers `get`/`post`/`put`/`delete`. Nota: `post` devuelve `Response` completo para poder leer `status` cuando se necesita.
- **services**: Funciones puras por dominio que llaman a `apiClient`, construyen querystrings con `URLSearchParams`, validan `ApiResponse.success` y devuelven datos tipados. No gestionan estado de UI.
- **hooks**: Hooks de React Query que envuelven a los services con `useQuery`/`useMutation`, definen `queryKey`, `staleTime`, `enabled` e invalidan queries tras mutaciones.
- **validations**: Schemas Yup (por ejemplo, login).
- **barrels**: Re‑exports en `src/api/index.ts`, `src/api/services/index.ts` y `src/api/hooks/index.ts`.

#### Estructura mínima
```
src/api/
  client.ts
  index.ts
  services/
    index.ts
    <feature>.ts
  hooks/
    index.ts
    use<Feature>.ts
  validations/
    <schema>.ts
```

#### Skeletons
```ts
// src/api/client.ts
const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "https://example.com";

interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
}

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;
  private defaultTimeout: number = 60_000;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  setAuthToken(token: string) { 
    this.authToken = token; 
  }
  
  clearAuthToken() { 
    this.authToken = null; 
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit & { timeout?: number } = {}
  ): Promise<Response> {
    const url = `${this.baseURL}${endpoint}`;
    const timeout = options.timeout || this.defaultTimeout;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw new Error(`Request error: ${error.message}`);
      }
      throw new Error('Unknown request error');
    }
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'GET',
      ...config,
    });
    return response.json();
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<Response> {
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
    return response;
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...config,
    });
    return response.json();
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const response = await this.request<T>(endpoint, {
      method: 'DELETE',
      ...config,
    });
    return response.json();
  }
}

export const apiClient = new ApiClient();
```

```ts
// src/api/services/index.ts
export * from "./auth";
export * from "./dashboard";
// agrega más dominios
```

```ts
// src/api/services/dashboard.ts
import { apiClient } from "../client";
import type { ApiResponse, DashboardLineChartFilters, DashboardLineChartResponse } from "@/src/shared/types";

export const getDashboardLineChart = async (
  filters: DashboardLineChartFilters
): Promise<DashboardLineChartResponse> => {
  const query = new URLSearchParams({
    dateStart: filters.dateStart,
    dateEnd: filters.dateEnd,
    operators: filters.operators.join(","),
  }).toString();

  const response = await apiClient.get<ApiResponse<DashboardLineChartResponse>>(
    `/api/dashboard/line-chart?${query}`,
    { headers: { "Content-Type": "application/json" } }
  );

  if (!response.success || !response.data) {
    throw new Error(response.message || "Failed to fetch dashboard line chart");
  }
  return response.data;
};
```

```ts
// src/api/services/auth.ts
import { apiClient } from "../client";
import type { SignInFormData, SignInResponse } from "@/src/shared/types";

export const signInUser = async (data: SignInFormData): Promise<SignInResponse> => {
  const formData = new URLSearchParams();
  formData.append("email", data.email);
  formData.append("password", data.password);

  const response = await apiClient.post<SignInResponse>("/auth/sign-in/submit", formData, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  if (response.status !== 200) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData?.error || "Sign in failed");
  }
  
  const responseData = await response.json();
  if (!responseData) throw new Error("No data returned from sign in");
  return responseData;
};
```

```ts
// src/api/hooks/index.ts
export * from "./useDashboard";
export * from "./useAuth";
// agrega más hooks
```

```ts
// src/api/hooks/useDashboard.ts
import { useQuery } from "@tanstack/react-query";
import { getDashboardLineChart } from "../services";
import type { DashboardLineChartFilters, DashboardLineChartResponse } from "@/src/shared/types";

export const useDashboardLineChart = (filters: DashboardLineChartFilters) => {
  return useQuery<DashboardLineChartResponse, Error>({
    queryKey: ["dashboardLineChart", filters],
    queryFn: () => getDashboardLineChart(filters),
    enabled: Boolean(filters.dateStart && filters.dateEnd && filters.operators?.length),
    staleTime: 1000 * 60 * 2,
  });
};
```

```ts
// src/api/hooks/useAuth.ts
import { useMutation } from "@tanstack/react-query";
import { signInUser } from "../services";

export const useSignIn = () => {
  return useMutation({
    mutationFn: signInUser,
  });
};
```

```ts
// src/api/validations/loginValidationSchema.ts
import * as yup from "yup";

export default yup.object().shape({
  email: yup.string().required("Email is required").email("Please enter a valid email address"),
  password: yup.string().required("Password is required").min(3, "Password must be at least 3 characters long"),
});
```

```ts
// src/api/index.ts
export * from "./client";
export * from "./services";
export * from "./hooks";
```

#### Requisitos y convenciones
- **Dependencias**: `@tanstack/react-query`, `yup` (fetch es nativo).
- **ENV**: `EXPO_PUBLIC_API_URL`.
- **Tipos**: Define `ApiResponse<T>` y DTOs en `src/shared/types`; evita `any`.
- **Aliases**: Paths tipo `@/src/*` y `@shared/*` en `tsconfig.json`.
- **React Query**: Proveer `QueryClientProvider` y `queryKey` estables; invalidar tras mutaciones.
- **Auth**: Llamar `apiClient.setAuthToken(token)` tras login si necesitas Bearer.

#### Prompt replicable
```
Crea una carpeta src/api con arquitectura por capas:
- Un wrapper de fetch nativo en src/api/client.ts con baseURL desde EXPO_PUBLIC_API_URL, manejo de timeout con AbortController, métodos get/post/put/delete tipados, y métodos setAuthToken/clearAuthToken. Mantén post devolviendo Response completo.
- Carpeta src/api/services con funciones puras por dominio que usen apiClient, construyan URLSearchParams cuando aplique, validen ApiResponse<T> y devuelvan datos tipados. Incluye un services/index.ts que re-exporte todos.
- Carpeta src/api/hooks con hooks de React Query que envuelvan a los services (useQuery/useMutation), definan queryKey, staleTime y enabled, e invaliden queries tras mutaciones. Incluye hooks/index.ts como barrel.
- Carpeta src/api/validations con Yup schemas (p.ej., login).
- Un index.ts en src/api que re-exporte client, services y hooks.

Asegura:
- Tipos compartidos en src/shared/types, incluyendo ApiResponse<T> y DTOs.
- Path aliases en tsconfig.json para "@/src/*" y "@shared/*".
- Dependencias: @tanstack/react-query, yup (fetch es nativo).
- QueryClientProvider configurado en el root.
- Variable EXPO_PUBLIC_API_URL definida.

Provee skeletons:
- client.ts, services/dashboard.ts, services/auth.ts, hooks/useDashboard.ts y hooks/useAuth.ts, validations/loginValidationSchema.ts, y barrels (services/index.ts, hooks/index.ts, api/index.ts).
```


