/**
 * Chaves usadas para persistência no localStorage.
 * Fonte única — consumir apenas via StorageService.
 */
export const StorageKeys = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACTIVE_COMPANY: 'active_company',
  USER: 'user',
} as const
