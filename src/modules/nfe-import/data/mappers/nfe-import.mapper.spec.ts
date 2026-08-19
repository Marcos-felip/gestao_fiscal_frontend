import { describe, expect, it } from 'vitest'
import {
  toNfeImport,
  toNfeImportList,
} from '@/modules/nfe-import/data/mappers/nfe-import.mapper'
import { ContractError } from '@/core/errors/contract-error'
import { NfeImportMatch } from '@/core/enums/nfe-import-match.enum'
import { NfeImportStatus } from '@/core/enums/nfe-import-status.enum'

/**
 * O campo que carrega o peso desta tela é o `match`: ele diz **a confiança** do
 * casamento. Um valor desconhecido não pode virar item de aparência normal — a
 * tela autoriza entrada de estoque em cima dele.
 */

const item = (overrides: Record<string, unknown> = {}) => ({
  id: 'item-1',
  itemNumber: 1,
  supplierCode: '007',
  gtin: '7891234567895',
  description: 'REFRIG LATA 350',
  ncm: '22021000',
  cfop: '1102',
  unit: 'CX',
  quantity: '10.0000',
  unitPrice: '25.5000',
  totalAmount: '255.00',
  productId: 'prod-1',
  match: 'GTIN',
  ...overrides,
})

const payload = (overrides: Record<string, unknown> = {}) => ({
  id: 'import-1',
  status: 'READY',
  chaveAcesso: '31260851720322000146550010000000051234567890',
  number: 4321,
  series: 1,
  issuedAt: '2026-08-15T12:30:00.000Z',
  issuerCnpj: '51720322000146',
  issuerName: 'Distribuidora Teste LTDA',
  totalAmount: '255.00',
  supplierId: 'partner-1',
  supplier: { id: 'partner-1', name: 'Distribuidora Teste LTDA' },
  establishment: { id: 'estab-1', name: 'Matriz' },
  purchase: null,
  duplicatas: [],
  items: [item()],
  createdAt: '2026-08-17T10:00:00.000Z',
  ...overrides,
})

describe('toNfeImport', () => {
  it('lê a importação com os itens', () => {
    const result = toNfeImport(payload())

    expect(result.isRight).toBe(true)
    expect(result.right.issuerName).toBe('Distribuidora Teste LTDA')
    expect(result.right.items).toHaveLength(1)
    expect(result.right.items[0].description).toBe('REFRIG LATA 350')
  })

  it('coage os decimais que vêm como string', () => {
    const result = toNfeImport(payload())

    expect(result.right.totalAmount).toBe(255)
    expect(result.right.items[0].quantity).toBe(10)
    expect(result.right.items[0].unitPrice).toBe(25.5)
  })

  it('preserva a confiança do casamento', () => {
    const result = toNfeImport(
      payload({
        items: [
          item(),
          item({ id: 'item-2', match: 'SUPPLIER_CODE', supplierCode: '008' }),
          item({ id: 'item-3', match: 'UNMATCHED', productId: null }),
        ],
      }),
    )

    const [porGtin, porMemoria, semCasar] = result.right.items
    expect(porGtin.match).toBe(NfeImportMatch.GTIN)
    expect(porGtin.isRemembered).toBe(false)
    expect(porMemoria.isRemembered).toBe(true)
    expect(semCasar.isMatched).toBe(false)
  })

  it('recusa `match` fora da tabela em vez de exibir item de cara normal', () => {
    const result = toNfeImport(
      payload({ items: [item({ match: 'POR_SEMELHANCA' })] }),
    )

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('recusa status desconhecido', () => {
    const result = toNfeImport(payload({ status: 'AGUARDANDO' }))

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('conta o que falta apontar', () => {
    const result = toNfeImport(
      payload({
        status: 'PENDING',
        items: [item(), item({ id: 'item-2', match: 'UNMATCHED', productId: null })],
      }),
    )

    expect(result.right.unmatchedCount).toBe(1)
    expect(result.right.canConfirm).toBe(false)
  })

  it('só permite confirmar com todos os itens casados', () => {
    expect(toNfeImport(payload()).right.canConfirm).toBe(true)
  })

  it('importação que já virou compra não confirma de novo', () => {
    const result = toNfeImport(
      payload({
        status: 'IMPORTED',
        purchase: { id: 'purchase-1', purchaseNumber: 13 },
      }),
    )

    expect(result.right.canConfirm).toBe(false)
    expect(result.right.isImported).toBe(true)
    expect(result.right.purchaseNumber).toBe(13)
  })

  it('mede a diferença entre o total da nota e a soma dos itens', () => {
    // Frete e desconto vivem aí — não é erro, mas quem confere precisa ver.
    const result = toNfeImport(payload({ totalAmount: '285.00' }))

    expect(result.right.itemsTotal).toBe(255)
    expect(result.right.totalDifference).toBe(30)
  })

  it('lê as duplicatas como datas', () => {
    const result = toNfeImport(
      payload({
        duplicatas: [
          { numero: '001', vencimento: '2026-09-15T00:00:00.000Z', valor: 127.5 },
        ],
      }),
    )

    expect(result.right.duplicatas[0].numero).toBe('001')
    expect(result.right.duplicatas[0].vencimento?.getUTCMonth()).toBe(8)
  })

  it('nota sem duplicata não inventa parcela', () => {
    expect(toNfeImport(payload({ duplicatas: null })).right.duplicatas).toEqual(
      [],
    )
  })
})

describe('toNfeImportList', () => {
  it('lê o envelope paginado', () => {
    const result = toNfeImportList({
      data: [payload()],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.right.items).toHaveLength(1)
    expect(result.right.total).toBe(1)
  })

  it('recusa resposta sem o envelope', () => {
    const result = toNfeImportList([payload()])

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('lista vazia é resposta válida', () => {
    const result = toNfeImportList({ data: [], total: 0, page: 1, limit: 20 })

    expect(result.right.items).toEqual([])
  })

  it('status conhecido continua legível na lista', () => {
    const result = toNfeImportList({
      data: [payload({ status: 'PENDING' })],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.right.items[0].status).toBe(NfeImportStatus.PENDING)
  })
})
