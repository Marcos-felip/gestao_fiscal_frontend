import type { RouteRecordRaw } from 'vue-router'
import PayablesPage from '@/modules/payables/presentation/pages/payables-page.vue'
import PayableDetailPage from '@/modules/payables/presentation/pages/payable-detail-page.vue'
import { routeNames } from '@/router/route-names'

export const payablesRoutes: RouteRecordRaw[] = [
  {
    path: 'contas-a-pagar',
    name: routeNames.PAYABLES,
    component: PayablesPage,
    meta: {
      title: 'Contas a pagar',
      icon: 'Wallet',
      requiresPermission: 'payables.list',
    },
  },
  {
    path: 'contas-a-pagar/:id',
    name: routeNames.PAYABLE_DETAIL,
    component: PayableDetailPage,
    meta: { requiresPermission: 'payables.read' },
  },
]
