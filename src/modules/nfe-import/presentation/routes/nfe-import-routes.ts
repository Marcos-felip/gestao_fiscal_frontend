import type { RouteRecordRaw } from 'vue-router'
import NfeImportsPage from '@/modules/nfe-import/presentation/pages/nfe-imports-page.vue'
import NfeImportDetailPage from '@/modules/nfe-import/presentation/pages/nfe-import-detail-page.vue'
import { routeNames } from '@/router/route-names'

export const nfeImportRoutes: RouteRecordRaw[] = [
  {
    path: 'compras/importar',
    name: routeNames.NFE_IMPORTS,
    component: NfeImportsPage,
    meta: {
      tab: { id: 'purchases', title: 'Compras' },
      title: 'Importar nota de entrada',
      requiresPermission: 'purchases.import',
    },
  },
  {
    path: 'compras/importar/:id',
    name: routeNames.NFE_IMPORT_DETAIL,
    component: NfeImportDetailPage,
    meta: {
      tab: { id: 'purchases', title: 'Compras' },
      title: 'Conferência da nota',
      requiresPermission: 'purchases.import',
    },
  },
]
