/**
 * Configuration du mode d'intégration API (Phase 2 — SCHOLARFIND OpenAPI 1.1)
 *
 * RÈGLES STRICTES :
 * - Le mode par défaut est 'mock' (données de démonstration locales persistées).
 * - L'URL https://api.scholarfind.cm/api/v1 du contrat YAML est illustrative :
 *   aucun appel réseau ne doit être déclenché par défaut tant que le backend
 *   Java Spring Boot n'est pas déployé et explicitement activé.
 * - Aucun faux succès silencieux : en mode 'real', si le serveur Spring Boot
 *   est injoignable, une erreur explicite est remontée avec possibilité de revenir en mode 'mock'.
 */

export type ApiIntegrationMode = 'mock' | 'real';

export interface ApiRuntimeConfig {
  mode: ApiIntegrationMode;
  baseUrl: string;
  accessToken: string | null;
}

const API_CONFIG_STORAGE_KEY = 'scholarfind_api_runtime_config_v1';

const DEFAULT_CONFIG: ApiRuntimeConfig = {
  mode: 'mock',
  baseUrl: 'http://localhost:8080/api/v1',
  accessToken: null,
};

export const getApiRuntimeConfig = (): ApiRuntimeConfig => {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(API_CONFIG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<ApiRuntimeConfig>;
        return {
          mode: parsed.mode === 'real' ? 'real' : 'mock',
          baseUrl: parsed.baseUrl?.trim() || DEFAULT_CONFIG.baseUrl,
          accessToken: parsed.accessToken || null,
        };
      }
    }
  } catch {
    // Fallback to default mock config
  }
  return { ...DEFAULT_CONFIG };
};

export const saveApiRuntimeConfig = (patch: Partial<ApiRuntimeConfig>): ApiRuntimeConfig => {
  const current = getApiRuntimeConfig();
  const next: ApiRuntimeConfig = {
    ...current,
    ...patch,
    baseUrl: (patch.baseUrl ?? current.baseUrl).trim() || DEFAULT_CONFIG.baseUrl,
  };
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(API_CONFIG_STORAGE_KEY, JSON.stringify(next));
    }
  } catch {
    // Ignore storage errors
  }
  return next;
};

export const resetToMockMode = (): ApiRuntimeConfig => {
  return saveApiRuntimeConfig({ mode: 'mock', accessToken: null });
};
