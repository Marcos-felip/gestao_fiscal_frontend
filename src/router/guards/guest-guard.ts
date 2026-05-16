import type { Router } from 'vue-router'

export function guestGuard(router: Router): void {
  router.beforeEach((to) => {
    if (to.meta.guest) {
      const token = localStorage.getItem('gf_access_token')
      if (token) {
        return { name: 'dashboard' }
      }
    }
  })
}