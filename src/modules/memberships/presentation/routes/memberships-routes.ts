import type { RouteRecordRaw } from 'vue-router'
import { routeNames } from '@/router/route-names'
import UsersPage from '../pages/users-page.vue'

export const membershipsRoutes: RouteRecordRaw[] = [
  {
    path: 'usuarios',
    name: routeNames.USERS,
    component: UsersPage,
    meta: {
      tab: { id: 'memberships', title: 'Usuários' },
      title: 'Usuários',
      icon: 'Users',
      requiresPermission: 'users.list',
    },
  },
]
