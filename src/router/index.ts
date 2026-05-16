import { createRouter, createWebHistory } from 'vue-router'
import { authGuard } from './guards/auth-guard'
import { guestGuard } from './guards/guest-guard'
import { authRoutes } from '@/modules/auth/presenter/routes/auth-routes'

const router = createRouter({
  history: createWebHistory(),
  routes: [...authRoutes],
})

authGuard(router)
guestGuard(router)

export default router
