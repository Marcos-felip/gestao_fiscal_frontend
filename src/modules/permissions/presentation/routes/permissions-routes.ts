import type { RouteRecordRaw } from 'vue-router'
import { routeNames } from '@/router/route-names'
import { MembershipRole } from '@/enums/membership-role.enum'
import PermissionsPage from '../pages/permissions-page.vue'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: 'users/permissions',
    name: routeNames.PERMISSIONS,
    component: PermissionsPage,
    meta: {
      title: 'Permissões',
      icon: 'ShieldCheck',
      requiresRole: MembershipRole.ADMIN,
    },
  },
]
