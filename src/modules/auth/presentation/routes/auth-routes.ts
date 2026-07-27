import type { RouteRecordRaw } from 'vue-router'
import { routeNames } from '@/router/route-names'
import LoginPage from '../pages/login-page.vue'
import RegisterPage from '../pages/register-page.vue'
import ChangePasswordPage from '../pages/change-password-page.vue'

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: routeNames.LOGIN,
    component: LoginPage,
    meta: { guest: true },
  },
  {
    path: '/register',
    name: routeNames.REGISTER,
    component: RegisterPage,
    meta: { guest: true },
  },
  {
    path: '/change-password',
    name: routeNames.CHANGE_PASSWORD,
    component: ChangePasswordPage,
    meta: { requiresAuth: true },
  },
]
