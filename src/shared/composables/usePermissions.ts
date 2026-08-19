import { computed } from 'vue'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { usePermissionsStore } from '@/modules/permissions/presentation/stores/permissions-store'
import { MembershipRole, roleRank } from '@/core/enums/membership-role.enum'

/**
 * API de autorização consumida por telas, guards e sidebar.
 * Combina o papel (auth-store) com as permissões efetivas (permissions-store).
 * OWNER tem acesso total por definição.
 */
export function usePermissions() {
  const authStore = useAuthStore()
  const permissionsStore = usePermissionsStore()

  const role = computed(() => authStore.userRole as MembershipRole | null)

  const isOwner = computed(() => role.value === MembershipRole.OWNER)

  function can(code: string): boolean {
    if (isOwner.value) return true
    return permissionsStore.can(code)
  }

  function canAny(list: string[]): boolean {
    if (isOwner.value) return true
    return permissionsStore.canAny(list)
  }

  /** Papel atual é >= ao mínimo exigido na hierarquia. */
  function isAtLeast(min: MembershipRole): boolean {
    const current = role.value
    if (!current) return false
    return roleRank[current] >= roleRank[min]
  }

  return {
    role,
    isOwner,
    can,
    canAny,
    isAtLeast,
    reload: permissionsStore.load,
    ensureLoaded: permissionsStore.ensureLoaded,
  }
}
