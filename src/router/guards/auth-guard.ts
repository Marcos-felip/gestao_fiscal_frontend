import type { Router } from 'vue-router'
import { routeNames } from '../route-names'
import { StorageService } from '@/core/utils/storage'

export function authGuard(router: Router): void {
  router.beforeEach((to) => {
    if (to.meta.requiresAuth) {
      const token = StorageService.getToken()
      if (!token) {
        return { name: routeNames.LOGIN, query: { redirect: to.fullPath } }
      }
    }
  })
}
