import type { RouteRecordRaw } from 'vue-router'
import SalesPage from '@/modules/sales/presentation/pages/sales-page.vue'
import SaleFormPage from '@/modules/sales/presentation/pages/sale-form-page.vue'
import SaleDetailPage from '@/modules/sales/presentation/pages/sale-detail-page.vue'
import { routeNames } from '@/router/route-names'

/** Telas de vendas que vivem dentro do AppLayout (com sidebar/navbar). */
export const salesRoutes: RouteRecordRaw[] = [
  {
    path: 'sales',
    name: routeNames.SALES,
    component: SalesPage,
    meta: {
      title: 'Vendas',
      icon: 'ShoppingBag',
      requiresPermission: 'sales.list',
    },
  },
  {
    path: 'sales/:id',
    name: routeNames.SALE_DETAIL,
    component: SaleDetailPage,
    meta: { requiresPermission: 'sales.read' },
  },
]

/**
 * PDV: rota imersiva em tela cheia, FORA do AppLayout (sem sidebar/navbar),
 * para o operador focar na venda de balcão.
 */
export const pdvRoutes: RouteRecordRaw[] = [
  {
    path: '/pdv',
    name: routeNames.PDV,
    component: SaleFormPage,
    meta: { requiresAuth: true, requiresPermission: 'sales.create' },
  },
]
