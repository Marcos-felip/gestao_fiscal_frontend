import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'
import { forcePasswordGuard } from './guards/force-password-guard'
import { permissionGuard } from './guards/permission-guard'
import { authRoutes } from '@/modules/auth/presentation/routes/auth-routes'
import { dashboardRoutes } from '@/modules/dashboard/presentation/routes/dashboard-routes'
import { companiesRoutes } from '@/modules/companies/presentation/routes/companies-routes'
import { establishmentsRoutes } from '@/modules/establishments/presentation/routes/establishments-routes'
import { partnersRoutes } from '@/modules/partners/presentation/routes/partners-routes'
import { productsRoutes } from '@/modules/products/presentation/routes/products-routes'
import { stockRoutes } from '@/modules/stock/presentation/routes/stock-routes'
import { purchasesRoutes } from '@/modules/purchases/presentation/routes/purchases-routes'
import { membershipsRoutes } from '@/modules/memberships/presentation/routes/memberships-routes'
import { permissionsRoutes } from '@/modules/permissions/presentation/routes/permissions-routes'
import { errorRoutes } from '@/modules/errors/presentation/routes/error-routes'
import AppLayout from '@/shared/components/layouts/app-layout.vue'
import { useProgress } from '@/shared/composables'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        ...dashboardRoutes,
        ...companiesRoutes,
        ...establishmentsRoutes,
        ...partnersRoutes,
        ...productsRoutes,
        ...stockRoutes,
        ...purchasesRoutes,
        ...membershipsRoutes,
        ...permissionsRoutes,
      ],
    },
    ...authRoutes,
    ...errorRoutes,
  ],
})

authGuard(router)
guestGuard(router)
forcePasswordGuard(router)
permissionGuard(router)

// Barra de progresso durante a navegação.
const progress = useProgress()
router.beforeEach(() => {
  progress.start()
})
router.afterEach(() => {
  progress.done()
})
router.onError(() => {
  progress.done()
})

export default router
