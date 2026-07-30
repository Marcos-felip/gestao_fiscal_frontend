import type { RouteRecordRaw } from 'vue-router'
import PurchasesPage from '@/modules/purchases/presentation/pages/purchases-page.vue'
import PurchaseFormPage from '@/modules/purchases/presentation/pages/purchase-form-page.vue'
import PurchaseDetailPage from '@/modules/purchases/presentation/pages/purchase-detail-page.vue'
import { routeNames } from '@/router/route-names'

export const purchasesRoutes: RouteRecordRaw[] = [
  {
    path: 'compras',
    name: routeNames.PURCHASES,
    component: PurchasesPage,
    meta: {
      title: 'Compras',
      icon: 'ShoppingCart',
      requiresPermission: 'purchases.list',
    },
  },
  {
    path: 'compras/nova',
    name: routeNames.PURCHASE_NEW,
    component: PurchaseFormPage,
    meta: { requiresPermission: 'purchases.create' },
  },
  {
    path: 'compras/:id',
    name: routeNames.PURCHASE_DETAIL,
    component: PurchaseDetailPage,
    meta: { requiresPermission: 'purchases.read' },
  },
]
