import { ref, watch } from 'vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { StorageKeys } from '@/core/constants/storage-keys'

/**
 * useTabs — abas de páginas abertas (estilo navegador).
 *
 * Estado singleton (definido fora da função) persistido em localStorage. A aba
 * "Início" é fixa. A aba ativa é derivada da rota atual (não é guardada aqui).
 */

/** Declarado em `meta.tab` das rotas que compartilham a mesma aba. */
export interface RouteTabMeta {
  id: string
  title: string
}

export interface AppTab {
  id: string
  path: string
  label: string
  icon: string
  closable: boolean
}

const HOME_TAB: AppTab = {
  id: 'home',
  path: '/',
  label: 'Início',
  icon: 'LayoutDashboard',
  closable: false,
}

/**
 * Identidade da aba de uma rota.
 *
 * Sem `meta.tab`, o caminho serve de identidade — é o comportamento anterior,
 * preservado para rota avulsa.
 */
export function tabIdOf(route: RouteLocationNormalizedLoaded): string | null {
  // A raiz é sempre a aba fixa. Sem isto ela ganharia identidade `'/'`, que não
  // bate com o id da fixa, e o início apareceria duas vezes — a segunda
  // fechável.
  if (route.path === HOME_TAB.path) return HOME_TAB.id

  const tab = route.meta.tab as RouteTabMeta | undefined
  if (tab) return tab.id

  return route.meta.title ? route.path : null
}

function load(): AppTab[] {
  try {
    const raw = localStorage.getItem(StorageKeys.OPEN_TABS)
    if (!raw) return [HOME_TAB]
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed) || parsed.length === 0) return [HOME_TAB]

    const rest = (parsed as AppTab[]).filter(
      (t) =>
        typeof t.id === 'string' &&
        t.id !== HOME_TAB.id &&
        t.path !== HOME_TAB.path,
    )
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

/**
 * Abre a aba do assunto da rota, ou atualiza a existente.
 *
 * Atualizar o caminho é o que faz a aba lembrar onde a pessoa parou: sair para
 * outra aba e voltar devolve a mesma tela, não o começo do assunto.
 */
function openFromRoute(route: RouteLocationNormalizedLoaded): void {
  const id = tabIdOf(route)
  if (!id) return

  const meta = route.meta.tab as RouteTabMeta | undefined
  const label = meta?.title ?? (route.meta.title as string)
  const existente = tabs.value.find((t) => t.id === id)

  if (existente) {
    existente.path = route.path
    return
  }

  tabs.value.push({
    id,
    path: route.path,
    label,
    icon: (route.meta.icon as string | undefined) ?? 'File',
    closable: id !== HOME_TAB.id,
  })
}

function closeTab(id: string): string | null {
  const index = tabs.value.findIndex((t) => t.id === id)
  if (index === -1) return null
  if (!tabs.value[index].closable) return null

  tabs.value.splice(index, 1)
  const neighbor = tabs.value[index - 1] ?? tabs.value[index] ?? null
  return neighbor?.path ?? HOME_TAB.path
}

export function useTabs() {
  return { tabs, openFromRoute, closeTab, tabIdOf }
}
