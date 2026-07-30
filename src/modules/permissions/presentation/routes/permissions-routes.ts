import type { RouteRecordRaw } from 'vue-router'
import { routeNames } from '@/router/route-names'
import ProfilesPage from '../pages/profiles-page.vue'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: 'perfis-de-permissao',
    name: routeNames.PERMISSION_PROFILES,
    component: ProfilesPage,
    meta: {
      title: 'Perfis de permissão',
      icon: 'ShieldPlus',
      requiresPermission: 'permissions.manage',
    },
  },
]
