export const routeNames = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
  COMPANY: 'company',
  FORBIDDEN: 'forbidden',
  NOT_FOUND: 'not-found',
  SERVER_ERROR: 'server-error',
  BAD_GATEWAY: 'bad-gateway',
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]
