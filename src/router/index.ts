import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/auth/presenter/pages/login-page.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/modules/auth/presenter/pages/register-page.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('@/shared/layouts/app-layout.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/dashboard',
        },
        {
          path: 'dashboard',
          name: 'dashboard',
          component: () => import('@/modules/auth/presenter/pages/dashboard-page.vue'),
        },
      ],
    },
  ],
})

authGuard(router)
guestGuard(router)

export default router