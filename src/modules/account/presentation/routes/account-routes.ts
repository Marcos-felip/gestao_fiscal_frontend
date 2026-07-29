import type { RouteRecordRaw } from 'vue-router'
import AccountPage from '@/modules/account/presentation/pages/account-page.vue'
import { routeNames } from '@/router/route-names'

export const accountRoutes: RouteRecordRaw[] = [
  {
    // Sem permissão especial: todo usuário autenticado edita o próprio perfil.
    path: 'account',
    name: routeNames.ACCOUNT,
    component: AccountPage,
    meta: { title: 'Minha conta', icon: 'User' },
  },
]
