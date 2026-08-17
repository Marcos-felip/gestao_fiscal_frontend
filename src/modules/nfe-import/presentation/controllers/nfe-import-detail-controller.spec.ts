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
    cfop: null,
    unit: 'CX',
    quantity: 10,
    unitPrice: 25.5,
    totalAmount: 255,
    productId: 'prod-1',
    match: NfeImportMatch.GTIN,
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

  getUseCase.execute.mockResolvedValue(Either.right(makeImport([makeItem()])))
  listProductsUseCase.execute.mockResolvedValue(
    Either.right({ items: [], total: 0, page: 1, limit: 100 }),
  )

  const controller = new NfeImportDetailController(
    getUseCase as never,
    setItemUseCase as never,
    confirmUseCase as never,
    listProductsUseCase as never,
  )

  return { controller, getUseCase, setItemUseCase, confirmUseCase }
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
