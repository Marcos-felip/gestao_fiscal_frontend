import type { Router } from 'vue-router'
import { routeNames } from '../route-names'
import type { MembershipRole } from '@/enums/membership-role.enum'
import { usePermissions } from '@/modules/permissions/presentation/composables/usePermissions'

/**
 * Protege rotas por permissão (`meta.requiresPermission`) e/ou papel
 * (`meta.requiresRole`). Sem essas metas, a rota é liberada.
 */
export function permissionGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const requiredPermission = to.meta.requiresPermission as string | undefined
    const requiredRole = to.meta.requiresRole as MembershipRole | undefined

    if (!requiredPermission && !requiredRole) return true

    const { ensureLoaded, can, isAtLeast } = usePermissions()
    await ensureLoaded()

    if (requiredPermission && !can(requiredPermission)) {
      return { name: routeNames.FORBIDDEN }
    }
    if (requiredRole && !isAtLeast(requiredRole)) {
      return { name: routeNames.FORBIDDEN }
    }
    return true
  })
}
