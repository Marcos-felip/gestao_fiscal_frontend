import type { Router } from 'vue-router'

export function authGuard(router: Router): void {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
      const token = localStorage.getItem('gf_access_token')
      if (!token) {
        return { name: 'login', query: { redirect: to.fullPath } }
      }
    }
  })
}