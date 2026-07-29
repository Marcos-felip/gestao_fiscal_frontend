import { describe, expect, it } from 'vitest'
import {
  toPurchase,
  toPurchaseList,
} from '@/modules/purchases/data/mappers/purchase.mapper'
import { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'
import { PurchaseItem } from '@/modules/purchases/domain/entities/purchase-item.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'pur-1',
  companyId: 'comp-1',
  establishmentId: 'est-1',
  supplierId: 'par-1',
  supplier: { id: 'par-1', name: 'Fornecedor ACME' },
  status: 'DRAFT',
  purchaseNumber: 3,
  totalAmount: '499.80',
  notes: 'Compra mensal',
  purchaseDate: '2026-01-10T00:00:00.000Z',
  createdAt: '2026-01-10T00:00:00.000Z',
  updatedAt: '2026-01-10T00:00:00.000Z',
  items: [
    {
      id: 'it-1',
      productId: 'prod-1',
      product: { id: 'prod-1', name: 'Tênis', unit: 'PC' },
      quantity: '2.0000',
      unitPrice: '249.9000',
      total: '499.80',
    },
  ],
}

describe('toPurchase', () => {
  it('constrói a compra com itens e fornecedor achatados', () => {
    const result = toPurchase(respostaValida)

    expect(result.isRight).toBe(true)
    const purchase = result.right
    expect(purchase).toBeInstanceOf(Purchase)
    expect(purchase.supplierName).toBe('Fornecedor ACME')
    expect(purchase.status).toBe('DRAFT')
    expect(purchase.totalAmount).toBe(499.8)
    expect(purchase.itemsCount).toBe(1)
    expect(purchase.items[0]).toBeInstanceOf(PurchaseItem)
    expect(purchase.items[0].productName).toBe('Tênis')
    expect(purchase.items[0].quantity).toBe(2)
    expect(purchase.items[0].unitPrice).toBe(249.9)
  })

  it('aplica defaults quando fornecedor e itens vêm ausentes', () => {
    const result = toPurchase({
      id: 'pur-2',
      companyId: 'comp-1',
      establishmentId: 'est-1',
      status: 'CONFIRMED',
      purchaseNumber: 4,
    })

    expect(result.isRight).toBe(true)
    const purchase = result.right
    expect(purchase.supplierId).toBeNull()
    expect(purchase.supplierName).toBeNull()
    expect(purchase.totalAmount).toBe(0)
    expect(purchase.items).toEqual([])
  })

  it('rejeita resposta sem establishmentId (ContractError)', () => {
    const { establishmentId: _establishmentId, ...sem } = respostaValida

    const result = toPurchase(sem)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error).toBeInstanceOf(ContractError)
    expect(error.resource).toBe('purchases')
    expect(error.issues.join(' ')).toContain('establishmentId')
  })
})

describe('toPurchaseList', () => {
  it('lê o envelope paginado e traduz data → items', () => {
    const result = toPurchaseList({
      data: [respostaValida],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    const list = result.right
    expect(list.items).toHaveLength(1)
    expect(list.items[0]).toBeInstanceOf(Purchase)
    expect(list.total).toBe(1)
  })

  it('rejeita quando o payload não é o envelope esperado', () => {
    const result = toPurchaseList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
