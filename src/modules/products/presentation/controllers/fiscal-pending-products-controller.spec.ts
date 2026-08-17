import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { ServerError } from '@/core/errors/server-error'
import { FiscalPendingProductsController } from './fiscal-pending-products-controller'

/**
 * A lista é filtrada **no servidor**. O que precisa continuar verdade: a busca
 * volta para a página 1 (senão a página 3 de um resultado de uma página fica
 * vazia sem explicação) e o erro chega pela subclasse de `DomainError`.
 */

const pagina = (total: number, page = 1) =>
  Either.right({
    items: [
      {
        id: 'prod-1',
        name: 'Refrigerante',
        sku: null,
        ncm: null,
        cfop: '5102',
        origin: 0,
        csosn: '102',
        cstIcms: null,
        pendencias: ['NCM ausente ou fora do formato de 8 dígitos'],
      },
    ],
    total,
    page,
    limit: 20,
  })

const build = () => {
  const listUseCase = { execute: vi.fn() }
  listUseCase.execute.mockResolvedValue(pagina(1))

  const controller = new FiscalPendingProductsController(listUseCase as never)

  return { controller, listUseCase }
}

describe('FiscalPendingProductsController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('carrega a página e guarda o total do servidor', async () => {
    const { controller } = build()

    await controller.loadList()

    expect(controller.products.value).toHaveLength(1)
    expect(controller.products.value[0].pendencias).toHaveLength(1)
    expect(controller.total.value).toBe(1)
    expect(controller.loaded.value).toBe(true)
  })

  it('a busca volta para a página 1', async () => {
    const { controller, listUseCase } = build()
    listUseCase.execute.mockResolvedValue(pagina(80, 4))

    await controller.loadList()
    await controller.goToPage(3)
    await controller.setSearch('refri')

    const dto = listUseCase.execute.mock.calls.at(-1)?.[0] as {
      page: number
      search?: string
    }
    expect(dto.page).toBe(1)
    expect(dto.search).toBe('refri')
  })

  it('busca só de espaços não vira filtro', async () => {
    const { controller, listUseCase } = build()

    await controller.setSearch('   ')

    const dto = listUseCase.execute.mock.calls.at(-1)?.[0] as {
      search?: string
    }
    expect(dto.search).toBeUndefined()
  })

  it('não passa de página inexistente', async () => {
    const { controller, listUseCase } = build()

    await controller.loadList()
    listUseCase.execute.mockClear()
    await controller.goToPage(2)

    expect(listUseCase.execute).not.toHaveBeenCalled()
  })

  it('erro do backend chega pelo DomainError, não pela lista vazia', async () => {
    const { controller, listUseCase } = build()
    listUseCase.execute.mockResolvedValue(
      Either.left(new ServerError(500, 'Falha ao consultar produtos')),
    )

    await controller.loadList()

    expect(controller.hasError).toBe(true)
    expect(controller.products.value).toEqual([])
  })
})
