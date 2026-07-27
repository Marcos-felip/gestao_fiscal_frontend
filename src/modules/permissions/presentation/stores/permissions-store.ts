import { defineStore } from 'pinia'
import { ref } from 'vue'
import { makeGetMyPermissionsUseCase } from '@/modules/permissions/factories/permissions.factory'

/**
 * Guarda as permissões efetivas (`GET /permissions/me`) do usuário na empresa
 * ativa. É a fonte para habilitar/desabilitar ações e montar o menu.
 * Recarregar após login e troca de empresa; limpar no logout.
 */
export const usePermissionsStore = defineStore('permissions', () => {
  const codes = ref<Set<string>>(new Set())
  const loaded = ref(false)

  async function load(): Promise<void> {
    const result = await makeGetMyPermissionsUseCase().execute()
    if (result.isRight) {
      codes.value = new Set(result.right)
    }
    loaded.value = true
  }

  async function ensureLoaded(): Promise<void> {
    if (!loaded.value) await load()
  }

  function clear(): void {
    codes.value = new Set()
    loaded.value = false
  }

  function can(code: string): boolean {
    return codes.value.has(code)
  }

  function canAny(list: string[]): boolean {
    return list.some((code) => codes.value.has(code))
  }

  function canAll(list: string[]): boolean {
    return list.every((code) => codes.value.has(code))
  }

  return { codes, loaded, load, ensureLoaded, clear, can, canAny, canAll }
})
