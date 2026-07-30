import { describe, expect, it } from 'vitest'
import { toSaleContext } from '@/modules/sales/data/mappers/sale-context.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toSaleContext', () => {
  it('mapeia o contexto e converte decimais-string em número', () => {
    const result = toSaleContext({
      establishments: [{ id: 'est-1', name: 'Matriz' }],
      customers: [{ id: 'cli-1', name: 'João' }],
      products: [
        {
          id: 'prod-1',
          name: 'Caneta',
          sku: 'CAN-1',
          barcode: null,
          unit: 'UN',
          salePrice: '9.90',
          currentStock: '12',
        },
      ],
    })

    expect(result.isRight).toBe(true)
    const context = result.right
    expect(context.establishments).toEqual([{ id: 'est-1', name: 'Matriz' }])
    expect(context.customers).toEqual([{ id: 'cli-1', name: 'João' }])
    expect(context.products[0].salePrice).toBe(9.9)
    expect(context.products[0].currentStock).toBe(12)
    expect(context.products[0].unit).toBe('UN')
  })

  it('mantém salePrice nulo e aplica defaults de listas vazias', () => {
    const result = toSaleContext({
      products: [
        { id: 'prod-2', name: 'Sem preço', salePrice: null },
      ],
    })

    expect(result.isRight).toBe(true)
    const context = result.right
    expect(context.establishments).toEqual([])
    expect(context.customers).toEqual([])
    expect(context.products[0].salePrice).toBeNull()
    expect(context.products[0].currentStock).toBe(0)
  })

  it('devolve ContractError quando o payload é inválido', () => {
    const result = toSaleContext({ products: [{ name: 'Sem id' }] })

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
