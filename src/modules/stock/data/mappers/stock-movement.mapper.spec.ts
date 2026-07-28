import { describe, expect, it } from 'vitest'
import {
  toStockMovement,
  toStockMovementList,
} from '@/modules/stock/data/mappers/stock-movement.mapper'
import { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'mov-1',
  companyId: 'comp-1',
  productId: 'prod-1',
  product: { id: 'prod-1', name: 'Tênis Nike', unit: 'PC' },
  type: 'ENTRADA',
  quantity: '10.0000',
  reason: 'Compra #3',
  referenceId: 'pur-3',
  createdAt: '2026-01-01T00:00:00.000Z',
}

describe('toStockMovement', () => {
  it('constrói a entidade achatando produto e convertendo quantidade', () => {
    const result = toStockMovement(respostaValida)

    expect(result.isRight).toBe(true)
    const movement = result.right
    expect(movement).toBeInstanceOf(StockMovement)
    expect(movement.productName).toBe('Tênis Nike')
    expect(movement.productUnit).toBe('PC')
    expect(movement.type).toBe('ENTRADA')
    expect(movement.quantity).toBe(10)
    expect(movement.isAutomatic).toBe(true)
  })

  it('trata movimentação manual (sem referenceId) e sem produto incluído', () => {
    const result = toStockMovement({
      id: 'mov-2',
      companyId: 'comp-1',
      productId: 'prod-2',
      type: 'AJUSTE',
      quantity: 5,
    })

    expect(result.isRight).toBe(true)
    const movement = result.right
    expect(movement.productName).toBeNull()
    expect(movement.productUnit).toBeNull()
    expect(movement.reason).toBeNull()
    expect(movement.isAutomatic).toBe(false)
  })

  it('rejeita resposta sem productId (ContractError)', () => {
    const { productId: _productId, ...semProduto } = respostaValida

    const result = toStockMovement(semProduto)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error).toBeInstanceOf(ContractError)
    expect(error.resource).toBe('stock')
    expect(error.issues.join(' ')).toContain('productId')
  })
})

describe('toStockMovementList', () => {
  it('lê o envelope paginado e traduz data → items', () => {
    const result = toStockMovementList({
      data: [respostaValida],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    const list = result.right
    expect(list.items).toHaveLength(1)
    expect(list.items[0]).toBeInstanceOf(StockMovement)
    expect(list.total).toBe(1)
  })

  it('rejeita quando o payload não é o envelope esperado', () => {
    const result = toStockMovementList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
