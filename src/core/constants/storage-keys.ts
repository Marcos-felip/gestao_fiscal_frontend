/**
 * Chaves usadas para persistência no localStorage.
 * Fonte única — consumir apenas via StorageService.
 */
export const StorageKeys = {
  TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACTIVE_COMPANY: 'active_company',
  USER: 'user',
  OPEN_TABS: 'open_tabs',
  SIDEBAR_GROUPS: 'sidebar_groups',
} as const
