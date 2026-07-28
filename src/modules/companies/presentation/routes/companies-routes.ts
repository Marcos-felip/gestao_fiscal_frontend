import type { RouteRecordRaw } from 'vue-router'
import CompanyEditPage from '@/modules/companies/presentation/pages/company-edit-page.vue'
import { routeNames } from '@/router/route-names'

export const companiesRoutes: RouteRecordRaw[] = [
  {
    path: 'companies',
    name: routeNames.COMPANY,
    component: CompanyEditPage,
    meta: {
      title: 'Empresa',
      icon: 'Building2',
      requiresPermission: 'company.read',
    },
  },
]
