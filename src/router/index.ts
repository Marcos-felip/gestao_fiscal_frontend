import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'
import { routeNames } from './route-names'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: routeNames.LOGIN,
      component: () => import('@/modules/auth/presenter/pages/login-page.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: routeNames.REGISTER,
      component: () => import('@/modules/auth/presenter/pages/register-page.vue'),
      meta: { guest: true },
    },
  ],
})

authGuard(router)
guestGuard(router)

export default router
export { routeNames }