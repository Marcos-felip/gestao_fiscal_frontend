import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'
import { authRoutes } from '@/modules/auth/presentation/routes/auth-routes'
import { dashboardRoutes } from '@/modules/dashboard/presentation/routes/dashboard-routes'
import { errorRoutes } from '@/modules/errors/presentation/routes/error-routes'
import AppLayout from '@/shared/components/layouts/app-layout.vue'

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

export default router
