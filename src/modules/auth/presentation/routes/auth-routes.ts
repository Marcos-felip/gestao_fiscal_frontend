import type { RouteRecordRaw } from 'vue-router'
import LoginPage from '../pages/login-page.vue'
import RegisterPage from '../pages/register-page.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterPage,
    meta: { guest: true },
  },
]
