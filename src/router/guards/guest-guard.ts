import type { Router } from 'vue-router'
import { routeNames } from '../route-names'

export function guestGuard(router: Router): void {
  router.beforeEach((to) => {
    if (to.meta.guest) {
      const token = localStorage.getItem('access_token')
      if (token) {
        return { name: routeNames.DASHBOARD }
      }
    }
  })
}
