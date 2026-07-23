import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'
import { authRoutes } from '@/modules/auth/presentation/routes/auth-routes'
import { dashboardRoutes } from '@/modules/dashboard/presentation/routes/dashboard-routes'
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
      children: [...dashboardRoutes],
    },
    ...authRoutes,
    ...errorRoutes,
  ],
})

authGuard(router)
guestGuard(router)

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
