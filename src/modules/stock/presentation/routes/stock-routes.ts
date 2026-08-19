import type { RouteRecordRaw } from 'vue-router'
import StockPage from '@/modules/stock/presentation/pages/stock-page.vue'
import { routeNames } from '@/router/route-names'

export const stockRoutes: RouteRecordRaw[] = [
  {
    path: 'estoque',
    name: routeNames.STOCK,
    component: StockPage,
    meta: {
      tab: { id: 'stock', title: 'Estoque' },
      title: 'Estoque',
      icon: 'Layers',
      requiresPermission: 'stock.list',
    },
  },
]
