export const routeNames = {
  LOGIN: 'login',
  REGISTER: 'register',
  CHANGE_PASSWORD: 'change-password',
  DASHBOARD: 'dashboard',
  COMPANY: 'company',
  USERS: 'users',
  PERMISSIONS: 'permissions',
  PERMISSION_PROFILES: 'permission-profiles',
  ESTABLISHMENTS: 'establishments',
  ESTABLISHMENT_NEW: 'establishment-new',
  ESTABLISHMENT_EDIT: 'establishment-edit',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  SERVER_ERROR: 'server-error',
  BAD_GATEWAY: 'bad-gateway',
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]
