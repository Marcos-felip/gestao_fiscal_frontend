import type { Router } from 'vue-router'
import { routeNames } from '../route-names'

export function authGuard(router: Router): void {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
      const token = localStorage.getItem('gf_access_token')
      if (!token) {
        return { name: routeNames.LOGIN, query: { redirect: to.fullPath } }
      }
    }
  })
}
