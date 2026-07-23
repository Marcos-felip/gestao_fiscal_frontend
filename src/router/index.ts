import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'
import { authRoutes } from '@/modules/auth/presentation/routes/auth-routes'
import AppLayout from '@/shared/components/layouts/app-layout.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: AppLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'dashboard',
          component: {
            template:
              '<div class="text-center py-12"><h1 class="text-2xl font-bold">Dashboard</h1></div>',
          },
        },
      ],
    },
    ...authRoutes,
  ],
})

authGuard(router)
guestGuard(router)

export default router
