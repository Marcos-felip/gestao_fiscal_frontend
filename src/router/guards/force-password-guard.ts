import type { Router } from 'vue-router'
import { routeNames } from '../route-names'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'

/**
 * Enquanto o usuário estiver com `forcePasswordChange` ativo (senha provisória),
 * bloqueia a navegação para qualquer rota que não seja a troca de senha.
 */
export function forcePasswordGuard(router: Router): void {
  router.beforeEach((to) => {
    const authStore = useAuthStore()
    const mustChange = authStore.user?.forcePasswordChange ?? false

    if (mustChange && to.name !== routeNames.CHANGE_PASSWORD) {
      return { name: routeNames.CHANGE_PASSWORD }
    }
    return true
  })
}
