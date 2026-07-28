import type { RouteRecordRaw } from 'vue-router'
import { routeNames } from '@/router/route-names'
import { MembershipRole } from '@/enums/membership-role.enum'
import PermissionsPage from '../pages/permissions-page.vue'
import ProfilesPage from '../pages/profiles-page.vue'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: 'permissions',
    name: routeNames.PERMISSIONS,
    component: PermissionsPage,
    meta: {
      title: 'Permissões',
      icon: 'ShieldCheck',
      requiresRole: MembershipRole.ADMIN,
    },
  },
  {
    path: 'permission-profiles',
    name: routeNames.PERMISSION_PROFILES,
    component: ProfilesPage,
    meta: {
      title: 'Perfis de permissão',
      icon: 'ShieldPlus',
      requiresPermission: 'permissions.manage',
    },
  },
]
