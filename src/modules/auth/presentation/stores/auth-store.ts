import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import type { AuthToken } from '@/modules/auth/domain/responses/auth-token-response'
import { StorageService } from '@/core/utils/storage'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const token = ref<AuthToken | null>(null)

  const isAuthenticated = computed(() => token.value !== null)

  const isLoggedIn = computed(() => token.value !== null)

  const hasActiveCompany = computed(() => user.value?.hasActiveCompany ?? false)

  const userRole = computed(() => user.value?.role ?? null)

  function setUser(authUser: AuthUser): void {
    user.value = authUser
    StorageService.setUser({
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      companyActiveId: authUser.companyActiveId,
      role: authUser.role,
      forcePasswordChange: authUser.forcePasswordChange,
    })
    if (authUser.companyActiveId) {
      StorageService.setActiveCompanyId(authUser.companyActiveId)
    }
  }

  function setToken(authToken: AuthToken): void {
    token.value = authToken
    StorageService.setToken(authToken.accessToken)
    StorageService.setRefreshToken(authToken.refreshToken)
  }

  function clear(): void {
    user.value = null
    token.value = null
    StorageService.clearAll()
  }

  function initializeFromStorage(): void {
    const accessToken = StorageService.getToken()
    const refreshToken = StorageService.getRefreshToken()
    const storedUser = StorageService.getUser()

    if (accessToken && refreshToken) {
      token.value = { accessToken, refreshToken }
    }

    if (storedUser) {
      user.value = new AuthUser(
        storedUser.id as string,
        storedUser.name as string,
        storedUser.email as string,
        (storedUser.companyActiveId as string | null) ?? null,
        (storedUser.role as string | null) ?? null,
        (storedUser.forcePasswordChange as boolean) ?? false,
      )
    }
  }

  return {
    user,
    token,
    isAuthenticated,
    isLoggedIn,
    hasActiveCompany,
    userRole,
    setUser,
    setToken,
    clear,
    initializeFromStorage,
  }
})
