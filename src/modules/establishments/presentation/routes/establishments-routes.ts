import type { RouteRecordRaw } from 'vue-router'
import EstablishmentsPage from '@/modules/establishments/presentation/pages/establishments-page.vue'
import EstablishmentFormPage from '@/modules/establishments/presentation/pages/establishment-form-page.vue'
import { routeNames } from '@/router/route-names'

export const establishmentsRoutes: RouteRecordRaw[] = [
  {
    path: 'estabelecimentos',
    name: routeNames.ESTABLISHMENTS,
    component: EstablishmentsPage,
    meta: {
      tab: { id: 'establishments', title: 'Estabelecimentos' },
      title: 'Estabelecimentos',
      icon: 'Store',
      requiresPermission: 'establishments.list',
    },
  },
  {
    path: 'estabelecimentos/novo',
    name: routeNames.ESTABLISHMENT_NEW,
    component: EstablishmentFormPage,
    meta: { tab: { id: 'establishments', title: 'Estabelecimentos' }, requiresPermission: 'establishments.create'  },
  },
  {
    // Abre em somente leitura para quem tem read mas não edit.
    path: 'estabelecimentos/:id/editar',
    name: routeNames.ESTABLISHMENT_EDIT,
    component: EstablishmentFormPage,
    meta: { tab: { id: 'establishments', title: 'Estabelecimentos' }, requiresPermission: 'establishments.read'  },
  },
]
