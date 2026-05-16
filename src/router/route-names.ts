export const routeNames = {
  LOGIN: 'login',
  REGISTER: 'register',
  DASHBOARD: 'dashboard',
} as const

export type RouteName = (typeof routeNames)[keyof typeof routeNames]