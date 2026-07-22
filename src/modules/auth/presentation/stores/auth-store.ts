import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
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

    if (accessToken && refreshToken) {
      token.value = { accessToken, refreshToken }
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
