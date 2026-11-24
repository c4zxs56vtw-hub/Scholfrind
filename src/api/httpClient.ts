import { getApiRuntimeConfig } from './apiConfig';
import { ApiErrorDto } from './openapi.types';

/**
 * Erreur typée conforme au schéma `ApiError` du contrat OpenAPI 1.1.
 */
export class ScholarFindApiError extends Error {
  public readonly status: number;
  public readonly code?: string;
  public readonly traceId?: string;
  public readonly path: string;
  public readonly validationErrors: { field: string; reason: string }[];

  constructor(dto: Partial<ApiErrorDto> & { message: string; status: number; path: string }) {
    super(dto.message);
    this.name = 'ScholarFindApiError';
    this.status = dto.status;
    this.code = dto.code;
    this.traceId = dto.traceId;
    this.path = dto.path;
    this.validationErrors = dto.validationErrors || [];
  }
}

export interface HttpRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Client HTTP isolé pour le futur backend Java Spring Boot.
 *
 * GARDE-FOU :
 * - Refuse d'exécuter un appel réseau si le mode courant est 'mock'.
 * - Ne simule jamais un faux succès réseau.
 */
export async function executeHttpRequest<TResponse>(options: HttpRequestOptions): Promise<TResponse> {
  const config = getApiRuntimeConfig();

  if (config.mode !== 'real') {
    throw new ScholarFindApiError({
      status: 0,
      path: options.path,
      code: 'MOCK_MODE_ACTIVE',
      message:
        'Le frontend est actuellement en mode démonstration (mock). Activez le mode API réel dans les paramètres administrateur uniquement lorsque le serveur Spring Boot est démarré.',
    });
  }

  const baseUrl = config.baseUrl.replace(/\/+$/, '');
  const cleanPath = options.path.startsWith('/') ? options.path : `/${options.path}`;
  const url = new URL(`${baseUrl}${cleanPath}`);

  if (options.query) {
    Object.entries(options.query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, String(value));
      }
    });
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...options.headers,
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (config.accessToken) {
    headers['Authorization'] = `Bearer ${config.accessToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: 'include',
    });
  } catch {
    throw new ScholarFindApiError({
      status: 503,
      path: cleanPath,
      code: 'BACKEND_UNREACHABLE',
      message: `Impossible de joindre le backend Java Spring Boot (${baseUrl}). Vérifiez que le serveur est démarré ou repassez en mode démonstration (mock).`,
    });
  }

  if (response.status === 204) {
    return undefined as unknown as TResponse;
  }

  const text = await response.text();
  let parsed: unknown = null;
  if (text) {
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = null;
    }
  }

  if (!response.ok) {
    const errDto = (parsed || {}) as Partial<ApiErrorDto>;
    throw new ScholarFindApiError({
      status: response.status,
      path: errDto.path || cleanPath,
      code: errDto.code || errDto.error || `HTTP_${response.status}`,
      traceId: errDto.traceId,
      validationErrors: errDto.validationErrors,
      message:
        errDto.message ||
        `Erreur HTTP ${response.status} lors de l'appel à ${cleanPath}.`,
    });
  }

  return parsed as TResponse;
}
