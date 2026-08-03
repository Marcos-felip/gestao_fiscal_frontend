import type { RouteRecordRaw } from 'vue-router'
import CashRegistersPage from '@/modules/cash/presentation/pages/cash-registers-page.vue'
import CashSessionsPage from '@/modules/cash/presentation/pages/cash-sessions-page.vue'
import CashSessionDetailPage from '@/modules/cash/presentation/pages/cash-session-detail-page.vue'
import { routeNames } from '@/router/route-names'

export const cashRoutes: RouteRecordRaw[] = [
  {
    path: 'caixas',
    name: routeNames.CASH_REGISTERS,
    component: CashRegistersPage,
    meta: {
      title: 'Caixas',
      icon: 'Monitor',
      requiresPermission: 'cash-registers.list',
    },
  },
  {
    path: 'sessoes-de-caixa',
    name: routeNames.CASH_SESSIONS,
    component: CashSessionsPage,
    meta: {
      title: 'Sessões de caixa',
      icon: 'Archive',
      requiresPermission: 'cash.list',
    },
  },
  {
    path: 'sessoes-de-caixa/:id',
    name: routeNames.CASH_SESSION_DETAIL,
    component: CashSessionDetailPage,
    meta: { requiresPermission: 'cash.read' },
  },
]
