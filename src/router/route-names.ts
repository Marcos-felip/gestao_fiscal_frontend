export const routeNames = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  SERVER_ERROR: 'server-error',
  BAD_GATEWAY: 'bad-gateway',
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]
