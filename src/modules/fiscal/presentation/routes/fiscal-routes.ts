import type { RouteRecordRaw } from 'vue-router'
import FiscalSettingsPage from '@/modules/fiscal/presentation/pages/fiscal-settings-page.vue'
import { routeNames } from '@/router/route-names'

export const fiscalRoutes: RouteRecordRaw[] = [
  {
    path: 'configuracao-fiscal',
    name: routeNames.FISCAL_SETTINGS,
    component: FiscalSettingsPage,
    meta: {
      title: 'Configuração fiscal',
      icon: 'ScrollText',
      requiresPermission: 'fiscal.settings.read',
    },
  },
]
