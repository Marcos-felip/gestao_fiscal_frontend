import type { RouteRecordRaw } from 'vue-router'
import ReceivablesPage from '@/modules/receivables/presentation/pages/receivables-page.vue'
import ReceivableDetailPage from '@/modules/receivables/presentation/pages/receivable-detail-page.vue'
import { routeNames } from '@/router/route-names'

export const receivablesRoutes: RouteRecordRaw[] = [
  {
    path: 'contas-a-receber',
    name: routeNames.RECEIVABLES,
    component: ReceivablesPage,
    meta: {
      title: 'Contas a receber',
      icon: 'HandCoins',
      requiresPermission: 'receivables.list',
    },
  },
  {
    path: 'contas-a-receber/:id',
    name: routeNames.RECEIVABLE_DETAIL,
    component: ReceivableDetailPage,
    meta: { requiresPermission: 'receivables.read' },
  },
]
