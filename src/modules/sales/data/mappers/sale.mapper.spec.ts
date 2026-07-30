import { describe, expect, it } from 'vitest'
import { toSale, toSaleList } from '@/modules/sales/data/mappers/sale.mapper'
import { Sale } from '@/modules/sales/domain/entities/sale.entity'
import { SaleItem } from '@/modules/sales/domain/entities/sale-item.entity'
import { ContractError } from '@/core/errors/contract-error'

const respostaValida = {
  id: 'sale-1',
  companyId: 'comp-1',
  establishmentId: 'est-1',
  establishment: { id: 'est-1', name: 'Loja Centro' },
  customerId: 'cli-1',
  customer: { id: 'cli-1', name: 'Cliente ACME' },
  status: 'CONCLUIDA',
  paymentStatus: 'APROVADO',
  fiscalStatus: 'AUTORIZADO',
  saleNumber: 7,
  subtotal: '520.00',
  discount: '20.00',
  totalAmount: '500.00',
  paymentMethod: 'PIX',
  notes: 'Venda balcão',
  saleDate: '2026-02-10T00:00:00.000Z',
  createdAt: '2026-02-10T00:00:00.000Z',
  updatedAt: '2026-02-10T00:00:00.000Z',
  items: [
    {
      id: 'it-1',
      productId: 'prod-1',
      product: { id: 'prod-1', name: 'Camiseta', unit: 'PC' },
      quantity: '2.0000',
      unitPrice: '260.0000',
      total: '520.00',
    },
  ],
}

describe('toSale', () => {
  it('constrói a venda com itens, cliente e totais numéricos', () => {
    const result = toSale(respostaValida)

    expect(result.isRight).toBe(true)
    const sale = result.right
    expect(sale).toBeInstanceOf(Sale)
    expect(sale.customerName).toBe('Cliente ACME')
    expect(sale.status).toBe('CONCLUIDA')
    expect(sale.paymentStatus).toBe('APROVADO')
    expect(sale.subtotal).toBe(520)
    expect(sale.discount).toBe(20)
    expect(sale.totalAmount).toBe(500)
    expect(sale.paymentMethod).toBe('PIX')
    expect(sale.itemsCount).toBe(1)
    expect(sale.items[0]).toBeInstanceOf(SaleItem)
    expect(sale.items[0].productName).toBe('Camiseta')
    expect(sale.items[0].quantity).toBe(2)
    expect(sale.items[0].unitPrice).toBe(260)
  })

  it('aplica defaults quando cliente, itens e status auxiliares vêm ausentes', () => {
    const result = toSale({
      id: 'sale-2',
      companyId: 'comp-1',
      establishmentId: 'est-1',
      status: 'ORCAMENTO',
      saleNumber: 8,
    })

    expect(result.isRight).toBe(true)
    const sale = result.right
    expect(sale.customerId).toBeNull()
    expect(sale.customerName).toBeNull()
    expect(sale.paymentStatus).toBe('PENDENTE')
    expect(sale.fiscalStatus).toBe('NAO_EMITIDO')
    expect(sale.paymentMethod).toBeNull()
    expect(sale.subtotal).toBe(0)
    expect(sale.discount).toBe(0)
    expect(sale.totalAmount).toBe(0)
    expect(sale.items).toEqual([])
  })

  it('rejeita resposta sem establishmentId (ContractError)', () => {
    const { establishmentId: _establishmentId, ...sem } = respostaValida

    const result = toSale(sem)

    expect(result.isLeft).toBe(true)
    const error = result.left as ContractError
    expect(error).toBeInstanceOf(ContractError)
    expect(error.resource).toBe('sales')
    expect(error.issues.join(' ')).toContain('establishmentId')
  })
})

describe('toSaleList', () => {
  it('lê o envelope paginado e traduz data → items', () => {
    const result = toSaleList({
      data: [respostaValida],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    const list = result.right
    expect(list.items).toHaveLength(1)
    expect(list.items[0]).toBeInstanceOf(Sale)
    expect(list.total).toBe(1)
  })

  it('rejeita quando o payload não é o envelope esperado', () => {
    const result = toSaleList(respostaValida)

    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
