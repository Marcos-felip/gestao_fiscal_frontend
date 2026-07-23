import type { RouteRecordRaw } from 'vue-router'
import ForbiddenPage from '@/modules/errors/presentation/pages/forbidden-page.vue'
import NotFoundPage from '@/modules/errors/presentation/pages/not-found-page.vue'
import ServerErrorPage from '@/modules/errors/presentation/pages/server-error-page.vue'
import BadGatewayPage from '@/modules/errors/presentation/pages/bad-gateway-page.vue'
import { routeNames } from '@/router/route-names'

// Telas de erro públicas. O catch-all (404) DEVE ser a última rota registrada.
export const errorRoutes: RouteRecordRaw[] = [
  { path: '/403', name: routeNames.FORBIDDEN, component: ForbiddenPage },
  { path: '/500', name: routeNames.SERVER_ERROR, component: ServerErrorPage },
  { path: '/502', name: routeNames.BAD_GATEWAY, component: BadGatewayPage },
  {
    path: '/:pathMatch(.*)*',
    name: routeNames.NOT_FOUND,
    component: NotFoundPage,
  },
]
