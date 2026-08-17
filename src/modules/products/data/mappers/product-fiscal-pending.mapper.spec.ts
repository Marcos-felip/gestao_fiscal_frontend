import { describe, expect, it } from 'vitest'
import { toProductFiscalPendingList } from '@/modules/products/data/mappers/product-fiscal-pending.mapper'
import { ContractError } from '@/core/errors/contract-error'

/**
 * Esta lista existe pelas `pendencias`: quem decide o que falta é o backend, e
 * uma resposta sem esse campo devolveria uma lista de produtos sem dizer o que
 * fazer com eles — exatamente o que a tela veio resolver.
 */

const envelope = (data: unknown[]) => ({
  data,
  total: data.length,
  page: 1,
  limit: 20,
})

const produto = (overrides: Record<string, unknown> = {}) => ({
  id: 'prod-1',
  name: 'Refrigerante Lata 350ml',
  sku: 'REF350',
  ncm: '2202',
  cfop: '5102',
  origin: 0,
  csosn: '102',
  cstIcms: null,
  pendencias: ['NCM ausente ou fora do formato de 8 dígitos'],
  ...overrides,
})

describe('toProductFiscalPendingList', () => {
  it('lê o envelope paginado com os motivos de cada produto', () => {
    const result = toProductFiscalPendingList(envelope([produto()]))

    expect(result.isRight).toBe(true)
    expect(result.right.total).toBe(1)
    expect(result.right.items[0].name).toBe('Refrigerante Lata 350ml')
    expect(result.right.items[0].pendencias).toEqual([
      'NCM ausente ou fora do formato de 8 dígitos',
    ])
  })

  it('aceita mais de uma pendência no mesmo produto', () => {
    const result = toProductFiscalPendingList(
      envelope([
        produto({
          pendencias: ['NCM ausente', 'CFOP ausente', 'CSOSN não suportado'],
        }),
      ]),
    )

    expect(result.right.items[0].pendencias).toHaveLength(3)
  })

  it('normaliza os campos fiscais ausentes para nulo', () => {
    const result = toProductFiscalPendingList(
      envelope([{ id: 'p-2', name: 'Sem nada', pendencias: ['NCM ausente'] }]),
    )

    const item = result.right.items[0]
    expect(item.sku).toBeNull()
    expect(item.ncm).toBeNull()
    expect(item.cfop).toBeNull()
    expect(item.origin).toBeNull()
    expect(item.csosn).toBeNull()
  })

  it('recusa produto sem as pendências — é o dado que a tela existe para mostrar', () => {
    const result = toProductFiscalPendingList(
      envelope([produto({ pendencias: undefined })]),
    )

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
    expect(JSON.stringify(result.left)).toContain('pendencias')
  })

  it('recusa resposta sem o envelope de paginação', () => {
    const result = toProductFiscalPendingList([produto()])

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })

  it('lista vazia é resposta válida — significa nenhum produto pendente', () => {
    const result = toProductFiscalPendingList(envelope([]))

    expect(result.isRight).toBe(true)
    expect(result.right.items).toEqual([])
  })
})
