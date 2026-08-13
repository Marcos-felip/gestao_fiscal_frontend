import { ref, watch } from 'vue'
import { StorageKeys } from '@/core/constants/storage-keys'

/**
 * useFavorites — atalhos fixados pelo usuário, exibidos no topo da sidebar.
 *
 * **Favoritar não é fixar.** Fixar mantém a aba aberta no trilho; favoritar
 * guarda um atalho que sobrevive a fechar a aba, a sair do sistema e a trocar
 * de máquina no dia em que isso for para o servidor. Um é sobre a sessão, o
 * outro é sobre o hábito.
 *
 * O favorito guarda o **caminho**, não o assunto: quem favorita a configuração
 * do certificado quer voltar ao certificado, não ao começo da configuração.
 */

export interface Favorite {
  path: string
  label: string
  icon: string
}

function load(): Favorite[] {
  try {
    const raw = localStorage.getItem(StorageKeys.FAVORITES)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return (parsed as Favorite[]).filter(
      (f) => typeof f?.path === 'string' && typeof f?.label === 'string',
    )
  } catch {
    return []
  }
}

const favorites = ref<Favorite[]>(load())

watch(
  favorites,
  (value) =>
    localStorage.setItem(StorageKeys.FAVORITES, JSON.stringify(value)),
  { deep: true },
)

function isFavorite(path: string): boolean {
  return favorites.value.some((f) => f.path === path)
}

/** Alterna o favorito. Devolve `true` quando passou a ser favorito. */
function toggleFavorite(favorite: Favorite): boolean {
  const index = favorites.value.findIndex((f) => f.path === favorite.path)

  if (index >= 0) {
    favorites.value.splice(index, 1)
    return false
  }

  favorites.value.push({ ...favorite })
  return true
}

function removeFavorite(path: string): void {
  const index = favorites.value.findIndex((f) => f.path === path)
  if (index >= 0) favorites.value.splice(index, 1)
}

export function useFavorites() {
  return { favorites, isFavorite, toggleFavorite, removeFavorite }
}
