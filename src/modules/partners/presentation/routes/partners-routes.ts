import type { RouteRecordRaw } from 'vue-router'
import PartnersPage from '@/modules/partners/presentation/pages/partners-page.vue'
import PartnerFormPage from '@/modules/partners/presentation/pages/partner-form-page.vue'
import { routeNames } from '@/router/route-names'

export const partnersRoutes: RouteRecordRaw[] = [
  {
    path: 'parceiros',
    name: routeNames.PARTNERS,
    component: PartnersPage,
    meta: {
      title: 'Parceiros',
      icon: 'Users',
      requiresPermission: 'partners.list',
    },
  },
  {
    path: 'parceiros/novo',
    name: routeNames.PARTNER_NEW,
    component: PartnerFormPage,
    meta: { requiresPermission: 'partners.create' },
  },
  {
    // Abre em somente leitura para quem tem read mas não edit.
    path: 'parceiros/:id/editar',
    name: routeNames.PARTNER_EDIT,
    component: PartnerFormPage,
    meta: { requiresPermission: 'partners.read' },
  },
]
