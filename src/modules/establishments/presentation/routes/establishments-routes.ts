import type { RouteRecordRaw } from 'vue-router'
import EstablishmentsPage from '@/modules/establishments/presentation/pages/establishments-page.vue'
import EstablishmentFormPage from '@/modules/establishments/presentation/pages/establishment-form-page.vue'
import { routeNames } from '@/router/route-names'

export const establishmentsRoutes: RouteRecordRaw[] = [
  {
    path: 'establishments',
    name: routeNames.ESTABLISHMENTS,
    component: EstablishmentsPage,
    meta: { title: 'Estabelecimentos', icon: 'Store' },
  },
  {
    path: 'establishments/new',
    name: routeNames.ESTABLISHMENT_NEW,
    component: EstablishmentFormPage,
  },
  {
    path: 'establishments/:id/edit',
    name: routeNames.ESTABLISHMENT_EDIT,
    component: EstablishmentFormPage,
  },
]
