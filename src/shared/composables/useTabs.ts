import { ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { StorageKeys } from '@/core/constants/storage-keys'

/**
 * useTabs — abas de páginas abertas (estilo navegador).
 *
 * Estado singleton (definido fora da função) persistido em localStorage: cada
 * página visitada com `meta.title` vira uma aba. A aba "Início" é fixa. A aba
 * ativa é derivada da rota atual (não é guardada aqui).
 */

export interface AppTab {
  path: string
  label: string
  icon: string
  closable: boolean
}

const HOME_TAB: AppTab = {
  path: '/',
  label: 'Início',
  icon: 'LayoutDashboard',
  closable: false,
}

function load(): AppTab[] {
  try {
    const raw = localStorage.getItem(StorageKeys.OPEN_TABS)
    if (!raw) return [HOME_TAB]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return [HOME_TAB]
    const rest = (parsed as AppTab[]).filter((t) => t.path !== HOME_TAB.path)
    return [HOME_TAB, ...rest]
  } catch {
    return [HOME_TAB]
  }
}

const tabs = ref<AppTab[]>(load())

watch(
  tabs,
  (value) => localStorage.setItem(StorageKeys.OPEN_TABS, JSON.stringify(value)),
  { deep: true },
)

function openFromRoute(route: RouteLocationNormalizedLoaded): void {
  const title = route.meta.title as string | undefined
  if (!title) return

  const path = route.path
  if (tabs.value.some((t) => t.path === path)) return

  tabs.value.push({
    path,
    label: title,
    icon: (route.meta.icon as string | undefined) ?? 'File',
    closable: path !== HOME_TAB.path,
  })
}

function closeTab(path: string): string | null {
  const index = tabs.value.findIndex((t) => t.path === path)
  if (index === -1) return null
  if (!tabs.value[index].closable) return null

  tabs.value.splice(index, 1)
  const neighbor = tabs.value[index - 1] ?? tabs.value[index] ?? null
  return neighbor?.path ?? HOME_TAB.path
}

export function useTabs() {
  return { tabs, openFromRoute, closeTab }
}
