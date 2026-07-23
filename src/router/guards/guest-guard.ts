import type { Router } from 'vue-router'
import { routeNames } from '../route-names'
import { StorageService } from '@/core/utils/storage'

export function guestGuard(router: Router): void {
  router.beforeEach((to) => {
    if (to.meta.guest) {
      const token = StorageService.getToken()
      if (token) {
        return { name: routeNames.DASHBOARD }
      }
    }
  })
}
