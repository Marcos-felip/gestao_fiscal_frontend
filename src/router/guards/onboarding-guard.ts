import type { Router, RouteRecordName } from 'vue-router'
import { routeNames } from '../route-names'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { useCompaniesStore } from '@/modules/companies/presentation/stores/companies-store'

const EXEMPT: RouteRecordName[] = [
  routeNames.LOGIN,
  routeNames.REGISTER,
  routeNames.CHANGE_PASSWORD,
  routeNames.FORBIDDEN,
  routeNames.NOT_FOUND,
  routeNames.SERVER_ERROR,
  routeNames.BAD_GATEWAY,
]

/**
 * Enquanto a empresa ativa não estiver configurada (ou o usuário não tiver
 * empresa), força o fluxo de onboarding. Depois de configurada, sai dele.
 */
export function onboardingGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) return true
    if (to.name && EXEMPT.includes(to.name)) return true
    if (authStore.user?.forcePasswordChange) return true

    const companiesStore = useCompaniesStore()
    await companiesStore.ensureLoaded()

    if (to.name === routeNames.ONBOARDING) {
      return companiesStore.needsOnboarding
        ? true
        : { name: routeNames.DASHBOARD }
    }

    if (companiesStore.needsOnboarding) {
      return { name: routeNames.ONBOARDING }
    }
    return true
  })
}
