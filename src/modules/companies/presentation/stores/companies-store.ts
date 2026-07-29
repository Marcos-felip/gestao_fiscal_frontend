import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { makeListCompaniesUseCase } from '@/modules/companies/factories/companies.factory'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import type { Company } from '@/modules/companies/domain/entities/company.entity'

/**
 * Guarda as empresas do usuário (`GET /companies`) e deriva a empresa ativa a
 * partir do `companyActiveId` da sessão. Alimenta o seletor de empresa e o
 * gating de onboarding. Recarregar após login e troca de empresa; limpar no
 * logout — mesmo ciclo do `permissionsStore`.
 */
export const useCompaniesStore = defineStore('companies', () => {
  const companies = ref<Company[]>([])
  const loaded = ref(false)
  const authStore = useAuthStore()

  async function load(): Promise<void> {
    const result = await makeListCompaniesUseCase().execute()
    if (result.isRight) {
      companies.value = result.right
    }
    loaded.value = true
  }

  async function ensureLoaded(): Promise<void> {
    if (!loaded.value) await load()
  }

  function clear(): void {
    companies.value = []
    loaded.value = false
  }

  const activeCompany = computed(() => {
    const id = authStore.user?.companyActiveId ?? null
    if (!id) return null
    return companies.value.find((c) => c.id === id) ?? null
  })

  const hasMultiple = computed(() => companies.value.length > 1)

  const needsOnboarding = computed(() => {
    const id = authStore.user?.companyActiveId ?? null
    if (!id) return true

    const active = companies.value.find((c) => c.id === id)
    if (!active) return false
    return !active.isOnboarded
  })

  return {
    companies,
    loaded,
    load,
    ensureLoaded,
    clear,
    activeCompany,
    hasMultiple,
    needsOnboarding,
  }
})
