import type { RouteRecordRaw } from 'vue-router'
import DashboardPage from '@/modules/dashboard/presentation/pages/dashboard-page.vue'
import { routeNames } from '@/router/route-names'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: routeNames.DASHBOARD,
    component: DashboardPage,
  },
]
