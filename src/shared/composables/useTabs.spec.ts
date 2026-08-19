import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

/**
 * A aba identifica um **assunto**, não uma URL.
 *
 * Identificar por URL abria uma aba por clique: na configuração fiscal eram
 * seis abas com o mesmo nome, uma por seção, e em produtos a lista e o
 * formulário de criação viravam duas.
 */

const rota = (
  path: string,
  meta: Record<string, unknown> = {},
): RouteLocationNormalizedLoaded => ({ path, meta }) as never

const comAba = (path: string, id: string, title: string, icon = 'File') =>
  rota(path, { tab: { id, title }, title, icon })

/** O estado é singleton no módulo: cada teste recarrega para partir do zero. */
async function carregar() {
  vi.resetModules()
  localStorage.clear()
  const { useTabs } = await import('@/shared/composables/useTabs')
  return useTabs()
}

describe('useTabs — identidade da aba', () => {
  beforeEach(() => localStorage.clear())

  it('começa apenas com a aba fixa de início', async () => {
    const { tabs } = await carregar()

    expect(tabs.value).toHaveLength(1)
    expect(tabs.value[0].id).toBe('home')
    expect(tabs.value[0].closable).toBe(false)
  })

  it('abre uma aba por assunto, não por caminho', async () => {
    const { tabs, openFromRoute } = await carregar()

    openFromRoute(comAba('/produtos', 'products', 'Produtos'))
    openFromRoute(comAba('/produtos/novo', 'products', 'Produtos'))
    openFromRoute(comAba('/produtos/123/editar', 'products', 'Produtos'))

    expect(tabs.value).toHaveLength(2)
    expect(tabs.value[1].label).toBe('Produtos')
  })

  it('guarda na aba o último caminho visitado, para voltar onde parou', async () => {
    const { tabs, openFromRoute } = await carregar()

    openFromRoute(comAba('/produtos', 'products', 'Produtos'))
    openFromRoute(comAba('/produtos/123/editar', 'products', 'Produtos'))

    expect(tabs.value[1].path).toBe('/produtos/123/editar')
  })

  it('mantém o rótulo do assunto ao navegar dentro dele', async () => {
    const { tabs, openFromRoute } = await carregar()

    // A rota de detalhe tem título próprio ("Configuração do estabelecimento"),
    // mas a aba mostra o assunto — senão o rótulo mudaria a cada clique.
    openFromRoute(
      comAba('/configuracao-fiscal', 'fiscal-settings', 'Configuração fiscal'),
    )
    openFromRoute(
      rota('/configuracao-fiscal/estab-1/certificado', {
        tab: { id: 'fiscal-settings', title: 'Configuração fiscal' },
        title: 'Configuração do estabelecimento',
      }),
    )

    expect(tabs.value).toHaveLength(2)
    expect(tabs.value[1].label).toBe('Configuração fiscal')
  })

  it('cada seção da configuração fiscal reusa a mesma aba', async () => {
    const { tabs, openFromRoute } = await carregar()
    const secoes = ['visao-geral', 'numeracao', 'certificado', 'csc', 'sefaz']

    for (const secao of secoes) {
      openFromRoute(
        comAba(
          `/configuracao-fiscal/estab-1/${secao}`,
          'fiscal-settings',
          'Configuração fiscal',
        ),
      )
    }

    expect(tabs.value).toHaveLength(2)
  })

  it('assuntos diferentes abrem abas diferentes', async () => {
    const { tabs, openFromRoute } = await carregar()

    openFromRoute(comAba('/produtos', 'products', 'Produtos'))
    openFromRoute(comAba('/parceiros', 'partners', 'Parceiros'))

    expect(tabs.value.map((t) => t.id)).toEqual([
      'home',
      'products',
      'partners',
    ])
  })

  it('rota sem título não abre aba', async () => {
    const { tabs, openFromRoute } = await carregar()

    openFromRoute(rota('/pdv', { requiresAuth: true }))

    expect(tabs.value).toHaveLength(1)
  })

  it('a raiz não duplica a aba fixa de início', async () => {
    const { tabs, openFromRoute } = await carregar()

    // A rota do dashboard tem título próprio e nenhum grupo declarado. Sem
    // tratar a raiz, ela ganhava identidade '/' e virava uma segunda "Início",
    // essa fechável.
    openFromRoute(rota('/', { title: 'Início', icon: 'LayoutDashboard' }))

    expect(tabs.value).toHaveLength(1)
    expect(tabs.value[0].id).toBe('home')
    expect(tabs.value[0].closable).toBe(false)
  })

  it('rota com título e sem grupo continua tendo aba própria', async () => {
    const { tabs, openFromRoute } = await carregar()

    openFromRoute(rota('/avulsa', { title: 'Avulsa' }))

    expect(tabs.value).toHaveLength(2)
    expect(tabs.value[1].id).toBe('/avulsa')
  })
})

describe('useTabs — fechar', () => {
  beforeEach(() => localStorage.clear())

  it('fecha pelo assunto e devolve o caminho da vizinha', async () => {
    const { tabs, openFromRoute, closeTab } = await carregar()

    openFromRoute(comAba('/produtos', 'products', 'Produtos'))
    openFromRoute(comAba('/parceiros', 'partners', 'Parceiros'))

    const destino = closeTab('partners')

    expect(destino).toBe('/produtos')
    expect(tabs.value.map((t) => t.id)).toEqual(['home', 'products'])
  })

  it('não fecha a aba de início', async () => {
    const { tabs, closeTab } = await carregar()

    expect(closeTab('home')).toBeNull()
    expect(tabs.value).toHaveLength(1)
  })
})

describe('useTabs — abas gravadas antes da identidade por assunto', () => {
  it('descarta o que ficou no localStorage sem id', async () => {
    vi.resetModules()
    localStorage.setItem(
      'open_tabs',
      JSON.stringify([
        { path: '/', label: 'Início', icon: 'LayoutDashboard', closable: false },
        {
          path: '/configuracao-fiscal/e1/csc',
          label: 'Configuração do estabel…',
          icon: 'ScrollText',
          closable: true,
        },
      ]),
    )

    const { useTabs } = await import('@/shared/composables/useTabs')
    const { tabs } = useTabs()

    // Sem `id` elas reproduziriam o problema que a mudança resolve.
    expect(tabs.value).toHaveLength(1)
    expect(tabs.value[0].id).toBe('home')
  })
})

describe('useTabs — fixar', () => {
  beforeEach(() => localStorage.clear())

  it('fixadas vão para a frente das demais, com o início antes de tudo', async () => {
    const { tabs, openFromRoute, togglePin, ordenar } = await carregar()

    openFromRoute(comAba('/produtos', 'products', 'Produtos'))
    openFromRoute(comAba('/parceiros', 'partners', 'Parceiros'))
    togglePin('partners')

    expect(ordenar(tabs.value).map((t) => t.id)).toEqual([
      'home',
      'partners',
      'products',
    ])
  })

  it('não fixa a aba de início', async () => {
    const { tabs, togglePin } = await carregar()

    togglePin('home')

    expect(tabs.value[0].pinned).toBeUndefined()
  })
})

describe('useTabs — fechar em massa', () => {
  beforeEach(() => localStorage.clear())

  async function comTresAbas() {
    const api = await carregar()
    api.openFromRoute(comAba('/produtos', 'products', 'Produtos'))
    api.openFromRoute(comAba('/parceiros', 'partners', 'Parceiros'))
    api.openFromRoute(comAba('/estoque', 'stock', 'Estoque'))
    return api
  }

  it('fechar outras mantém a indicada e devolve o caminho dela', async () => {
    const { tabs, closeOthers } = await comTresAbas()

    const destino = closeOthers('partners')

    expect(tabs.value.map((t) => t.id)).toEqual(['home', 'partners'])
    expect(destino).toBe('/parceiros')
  })

  it('fechar outras poupa as fixadas', async () => {
    const { tabs, closeOthers, togglePin } = await comTresAbas()

    togglePin('products')
    closeOthers('stock')

    expect(tabs.value.map((t) => t.id)).toEqual(['home', 'products', 'stock'])
  })

  it('fechar todas deixa só o início quando nada está fixado', async () => {
    const { tabs, closeAll } = await comTresAbas()

    const destino = closeAll()

    expect(tabs.value.map((t) => t.id)).toEqual(['home'])
    expect(destino).toBe('/')
  })

  it('fechar todas poupa as fixadas', async () => {
    const { tabs, closeAll, togglePin } = await comTresAbas()

    togglePin('partners')
    closeAll()

    expect(tabs.value.map((t) => t.id)).toEqual(['home', 'partners'])
  })
})
