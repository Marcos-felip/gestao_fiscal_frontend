import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { ValidationError } from '@/core/errors/validation-error'
import { NfeImportMatch } from '@/core/enums/nfe-import-match.enum'
import { NfeImportStatus } from '@/core/enums/nfe-import-status.enum'
import {
  NfeImport,
  NfeImportItem,
} from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import { emptyProductForm } from '@/modules/products/presentation/schemas/product-schema'
import { NfeImportDetailController } from './nfe-import-detail-controller'

/**
 * O que precisa continuar verdade: pendente aparece primeiro (numa nota de 300
 * itens é o que importa), a resposta do backend substitui o estado inteiro
 * (senão o status não acompanha o último item resolvido), e a recusa chega pela
 * subclasse de `DomainError`, nunca pela string.
 */

const makeItem = (overrides: Partial<ConstructorParameters<typeof NfeImportItem>[0]> = {}) =>
  new NfeImportItem({
    id: 'item-1',
    itemNumber: 1,
    supplierCode: '007',
    gtin: '789',
    description: 'REFRIG LATA 350',
    ncm: null,
    cest: null,
    cfop: null,
    unit: 'CX',
    quantity: 10,
    unitPrice: 25.5,
    totalAmount: 255,
    productId: 'prod-1',
    match: NfeImportMatch.GTIN,
    origem: 0,
    situacaoIcms: '00',
    cstPis: '07',
    cstCofins: '07',
    ...overrides,
  })

const makeImport = (
  items: NfeImportItem[],
  status: NfeImportStatus = NfeImportStatus.READY,
) =>
  new NfeImport({
    id: 'import-1',
    status,
    chaveAcesso: '3126',
    number: 4321,
    series: 1,
    issuedAt: new Date('2026-08-15T12:30:00Z'),
    issuerCnpj: '51720322000146',
    issuerName: 'Distribuidora Teste LTDA',
    totalAmount: 255,
    supplierId: 'partner-1',
    supplierName: 'Distribuidora Teste LTDA',
    establishmentName: 'Matriz',
    purchaseId: null,
    purchaseNumber: null,
    duplicatas: [],
    items,
    createdAt: null,
  })

const build = () => {
  const getUseCase = { execute: vi.fn() }
  const setItemUseCase = { execute: vi.fn() }
  const confirmUseCase = { execute: vi.fn() }
  const listProductsUseCase = { execute: vi.fn() }
  const createProductUseCase = { execute: vi.fn() }

  getUseCase.execute.mockResolvedValue(Either.right(makeImport([makeItem()])))
  listProductsUseCase.execute.mockResolvedValue(
    Either.right({ items: [], total: 0, page: 1, limit: 100 }),
  )

  const controller = new NfeImportDetailController(
    getUseCase as never,
    setItemUseCase as never,
    confirmUseCase as never,
    listProductsUseCase as never,
    createProductUseCase as never,
  )

  return {
    controller,
    getUseCase,
    setItemUseCase,
    confirmUseCase,
    createProductUseCase,
  }
}

describe('NfeImportDetailController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('carrega a importação e o catálogo juntos', async () => {
    const { controller } = build()

    await controller.load('import-1')

    expect(controller.nfeImport.value?.issuerName).toBe(
      'Distribuidora Teste LTDA',
    )
    expect(controller.loaded.value).toBe(true)
  })

  it('coloca os itens pendentes primeiro', async () => {
    const { controller, getUseCase } = build()
    getUseCase.execute.mockResolvedValue(
      Either.right(
        makeImport([
          makeItem({ id: 'casado', itemNumber: 1 }),
          makeItem({
            id: 'pendente',
            itemNumber: 2,
            productId: null,
            match: NfeImportMatch.UNMATCHED,
          }),
        ]),
      ),
    )

    await controller.load('import-1')

    // Numa nota de 300 itens, o que importa é o que falta resolver.
    expect(controller.sortedItems.value[0].id).toBe('pendente')
  })

  it('a resposta de apontar substitui o estado inteiro', async () => {
    const { controller, getUseCase, setItemUseCase } = build()
    getUseCase.execute.mockResolvedValue(
      Either.right(
        makeImport(
          [
            makeItem({
              id: 'item-1',
              productId: null,
              match: NfeImportMatch.UNMATCHED,
            }),
          ],
          NfeImportStatus.PENDING,
        ),
      ),
    )
    setItemUseCase.execute.mockResolvedValue(
      Either.right(
        makeImport([makeItem({ id: 'item-1', match: NfeImportMatch.MANUAL })]),
      ),
    )

    await controller.load('import-1')
    const ok = await controller.setItemProduct('item-1', 'prod-5')

    expect(ok).toBe(true)
    // O status vira READY quando o último pendente é resolvido; recarregar por
    // fora perderia isso.
    expect(controller.nfeImport.value?.status).toBe(NfeImportStatus.READY)
    expect(controller.nfeImport.value?.canConfirm).toBe(true)
  })

  describe('cadastrar produto a partir do item', () => {
    const values = {
      ...emptyProductForm(),
      name: 'SUCO UVA INTEGRAL 1L',
      ncm: '20096900',
      costPrice: '8,50',
    }

    const pendente = () =>
      makeImport(
        [
          makeItem({
            id: 'item-1',
            productId: null,
            match: NfeImportMatch.UNMATCHED,
          }),
        ],
        NfeImportStatus.PENDING,
      )

    it('cria o produto e vincula o item no mesmo passo', async () => {
      const { controller, getUseCase, setItemUseCase, createProductUseCase } =
        build()
      getUseCase.execute.mockResolvedValue(Either.right(pendente()))
      createProductUseCase.execute.mockResolvedValue(
        Either.right({ id: 'prod-novo', name: 'SUCO UVA INTEGRAL 1L' }),
      )
      setItemUseCase.execute.mockResolvedValue(
        Either.right(
          makeImport([makeItem({ id: 'item-1', match: NfeImportMatch.MANUAL })]),
        ),
      )

      const ok = await controller.load('import-1').then(() =>
        controller.createProductForItem('item-1', values),
      )

      expect(ok).toBe(true)
      // Vincular junto é o ponto: separado, o usuário ficaria com o produto no
      // catálogo e o item ainda pendente — pior do que antes de começar.
      const [, itemId, productId] = setItemUseCase.execute.mock.calls[0] as [
        string,
        string,
        string,
      ]
      expect(itemId).toBe('item-1')
      expect(productId).toBe('prod-novo')
    })

    it('produto recusado não vincula nada', async () => {
      const { controller, getUseCase, setItemUseCase, createProductUseCase } =
        build()
      getUseCase.execute.mockResolvedValue(Either.right(pendente()))
      createProductUseCase.execute.mockResolvedValue(
        Either.left(new ValidationError('Já existe produto com este código')),
      )

      await controller.load('import-1')
      const ok = await controller.createProductForItem('item-1', values)

      expect(ok).toBe(false)
      expect(setItemUseCase.execute).not.toHaveBeenCalled()
      expect(controller.errorMessage).toContain('Já existe produto')
    })

    it('o produto novo entra no seletor, para o item não ficar sem nome', async () => {
      const { controller, getUseCase, setItemUseCase, createProductUseCase } =
        build()
      getUseCase.execute.mockResolvedValue(Either.right(pendente()))
      createProductUseCase.execute.mockResolvedValue(
        Either.right({ id: 'prod-novo', name: 'SUCO UVA INTEGRAL 1L' }),
      )
      setItemUseCase.execute.mockResolvedValue(
        Either.right(
          makeImport([makeItem({ id: 'item-1', match: NfeImportMatch.MANUAL })]),
        ),
      )

      await controller.load('import-1')
      await controller.createProductForItem('item-1', values)

      expect(controller.products.value[0].name).toBe('SUCO UVA INTEGRAL 1L')
    })

    it('não cadastra duas vezes em paralelo', async () => {
      const { controller, getUseCase, createProductUseCase } = build()
      getUseCase.execute.mockResolvedValue(Either.right(pendente()))
      createProductUseCase.execute.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve(Either.left(new ValidationError('x'))), 10),
          ),
      )

      await controller.load('import-1')
      await Promise.all([
        controller.createProductForItem('item-1', values),
        controller.createProductForItem('item-1', values),
      ])

      expect(createProductUseCase.execute).toHaveBeenCalledTimes(1)
    })
  })

  it('confirmar devolve o id da compra, para a tela levar até ela', async () => {
    const { controller, confirmUseCase } = build()
    const importada = makeImport([makeItem()], NfeImportStatus.IMPORTED)
    confirmUseCase.execute.mockResolvedValue(
      Either.right(
        new NfeImport({
          ...importada,
          purchaseId: 'purchase-1',
          purchaseNumber: 13,
          items: importada.items,
          duplicatas: [],
        }),
      ),
    )

    await controller.load('import-1')
    const purchaseId = await controller.confirm()

    expect(purchaseId).toBe('purchase-1')
  })

  it('recusa do backend chega pelo DomainError, não pela string', async () => {
    const { controller, confirmUseCase } = build()
    confirmUseCase.execute.mockResolvedValue(
      Either.left(
        new ValidationError('Falta apontar o produto do item 3 (PARAFUSO)'),
      ),
    )

    await controller.load('import-1')
    const purchaseId = await controller.confirm()

    expect(purchaseId).toBeNull()
    expect(controller.hasError).toBe(true)
    expect(controller.errorMessage).toContain('PARAFUSO')
  })

  it('não confirma duas vezes em paralelo', async () => {
    const { controller, confirmUseCase } = build()
    confirmUseCase.execute.mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () => resolve(Either.right(makeImport([makeItem()]))),
            10,
          ),
        ),
    )

    await controller.load('import-1')
    const [primeira, segunda] = await Promise.all([
      controller.confirm(),
      controller.confirm(),
    ])

    expect(confirmUseCase.execute).toHaveBeenCalledTimes(1)
    expect(primeira === null || segunda === null).toBe(true)
  })
})
