import { beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * Favoritar não é fixar.
 *
 * Fixar mantém a aba no trilho — é sobre a sessão. Favoritar guarda um atalho
 * na sidebar que sobrevive a fechar a aba e a sair do sistema — é sobre o
 * hábito. Por isso o favorito guarda o **caminho**: quem favorita a seção do
 * certificado quer voltar ao certificado, não ao começo da configuração.
 */

const certificado = {
  path: '/configuracao-fiscal/estab-1/certificado',
  label: 'Configuração fiscal',
  icon: 'ScrollText',
}

const produtos = { path: '/produtos', label: 'Produtos', icon: 'Package' }

async function carregar() {
  vi.resetModules()
  localStorage.clear()
  const { useFavorites } = await import('@/shared/composables/useFavorites')
  return useFavorites()
}

describe('useFavorites', () => {
  beforeEach(() => localStorage.clear())

  it('começa vazio', async () => {
    const { favorites } = await carregar()

    expect(favorites.value).toEqual([])
  })

  it('favorita e desfavorita pelo mesmo gesto', async () => {
    const { favorites, toggleFavorite, isFavorite } = await carregar()

    expect(toggleFavorite(produtos)).toBe(true)
    expect(isFavorite('/produtos')).toBe(true)

    expect(toggleFavorite(produtos)).toBe(false)
    expect(favorites.value).toEqual([])
  })

  it('distingue seções do mesmo assunto pelo caminho', async () => {
    const { favorites, toggleFavorite, isFavorite } = await carregar()

    toggleFavorite(certificado)

    expect(isFavorite(certificado.path)).toBe(true)
    expect(isFavorite('/configuracao-fiscal/estab-1/csc')).toBe(false)
    expect(favorites.value).toHaveLength(1)
  })

  it('não duplica ao favoritar o mesmo caminho duas vezes', async () => {
    const { favorites, toggleFavorite } = await carregar()

    toggleFavorite(produtos)
    toggleFavorite(produtos)
    toggleFavorite(produtos)

    expect(favorites.value).toHaveLength(1)
  })

  it('remove pelo caminho', async () => {
    const { favorites, toggleFavorite, removeFavorite } = await carregar()

    toggleFavorite(produtos)
    toggleFavorite(certificado)
    removeFavorite('/produtos')

    expect(favorites.value.map((f) => f.path)).toEqual([certificado.path])
  })

  it('ignora lixo gravado no localStorage', async () => {
    vi.resetModules()
    localStorage.setItem(
      'favorites',
      JSON.stringify([produtos, { path: 42 }, null, 'texto solto']),
    )

    const { useFavorites } = await import('@/shared/composables/useFavorites')

    expect(useFavorites().favorites.value).toHaveLength(1)
  })
})
