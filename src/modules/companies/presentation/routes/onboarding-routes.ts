import type { RouteRecordRaw } from 'vue-router'
import OnboardingPage from '@/modules/companies/presentation/pages/onboarding-page.vue'
import { routeNames } from '@/router/route-names'

/** Rota standalone (fora do AppLayout): fluxo de configuração inicial. */
export const onboardingRoutes: RouteRecordRaw[] = [
  {
    path: '/primeiros-passos',
    name: routeNames.ONBOARDING,
    component: OnboardingPage,
    meta: { requiresAuth: true },
  },
]
