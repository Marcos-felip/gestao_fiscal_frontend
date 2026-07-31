import { describe, expect, it } from 'vitest'
import {
  toReceivable,
  toReceivableArray,
  toReceivableList,
} from '@/modules/receivables/data/mappers/receivable.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toReceivable', () => {
  it('mapeia o título, achata cliente/venda e converte decimais-string', () => {
    const result = toReceivable({
      id: 'rec-1',
      establishmentId: 'est-1',
      type: 'RECEBER',
      status: 'PARCIAL',
      partnerId: 'cli-1',
      partner: { id: 'cli-1', name: 'João' },
      saleId: 'sale-1',
      sale: { id: 'sale-1', saleNumber: 42 },
      description: 'Venda #42 (1/3)',
      amount: '100.00',
      paidAmount: '30.00',
      dueDate: '2026-08-30T00:00:00.000Z',
      installmentNumber: 1,
      installmentTotal: 3,
      isOverdue: false,
      payments: [
        {
          id: 'pay-1',
          entryId: 'rec-1',
          amount: '30.00',
          paidAt: '2026-08-01T00:00:00.000Z',
          method: 'PIX',
          notes: null,
          createdAt: '2026-08-01T00:00:00.000Z',
        },
      ],
    })

    expect(result.isRight).toBe(true)
    const rec = result.right
    expect(rec.customerName).toBe('João')
    expect(rec.saleNumber).toBe(42)
    expect(rec.amount).toBe(100)
    expect(rec.paidAmount).toBe(30)
    expect(rec.balance).toBe(70)
    expect(rec.installmentLabel).toBe('1/3')
    expect(rec.canPay).toBe(true)
    expect(rec.payments[0].amount).toBe(30)
    expect(rec.payments[0].method).toBe('PIX')
  })

  it('aplica defaults quando faltam relações e listas', () => {
    const result = toReceivable({
      id: 'rec-2',
      status: 'ABERTO',
      description: 'Título avulso',
      amount: '50',
      dueDate: '2026-09-01T00:00:00.000Z',
    })

    expect(result.isRight).toBe(true)
    const rec = result.right
    expect(rec.customerName).toBeNull()
    expect(rec.saleNumber).toBeNull()
    expect(rec.paidAmount).toBe(0)
    expect(rec.balance).toBe(50)
    expect(rec.installmentLabel).toBe('1/1')
    expect(rec.isOverdue).toBe(false)
    expect(rec.payments).toEqual([])
  })

  it('reflete quitação e cancelamento nos getters de ação', () => {
    const paid = toReceivable({
      id: 'rec-3',
      status: 'PAGO',
      description: 'Quitado',
      amount: '10',
      paidAmount: '10',
      dueDate: '2026-09-01T00:00:00.000Z',
    }).right
    expect(paid.isPaid).toBe(true)
    expect(paid.canPay).toBe(false)
    expect(paid.canCancel).toBe(false)

    const cancelled = toReceivable({
      id: 'rec-4',
      status: 'CANCELADO',
      description: 'Cancelado',
      amount: '10',
      dueDate: '2026-09-01T00:00:00.000Z',
    }).right
    expect(cancelled.isCancelled).toBe(true)
    expect(cancelled.canPay).toBe(false)
    expect(cancelled.canCancel).toBe(false)
  })

  it('devolve ContractError quando o payload é inválido', () => {
    const result = toReceivable({ description: 'Sem id nem status' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toReceivableArray', () => {
  it('mapeia as parcelas geradas na criação', () => {
    const result = toReceivableArray([
      {
        id: 'rec-1',
        status: 'ABERTO',
        description: 'Título (1/2)',
        amount: '25',
        dueDate: '2026-09-01T00:00:00.000Z',
        installmentNumber: 1,
        installmentTotal: 2,
        isOverdue: false,
      },
      {
        id: 'rec-2',
        status: 'ABERTO',
        description: 'Título (2/2)',
        amount: '25',
        dueDate: '2026-10-01T00:00:00.000Z',
        installmentNumber: 2,
        installmentTotal: 2,
        isOverdue: false,
      },
    ])

    expect(result.isRight).toBe(true)
    expect(result.right).toHaveLength(2)
    expect(result.right[1].installmentLabel).toBe('2/2')
  })
})

describe('toReceivableList', () => {
  it('mapeia a lista paginada', () => {
    const result = toReceivableList({
      data: [
        {
          id: 'rec-1',
          status: 'ABERTO',
          description: 'Venda #1 (1/1)',
          amount: '99.90',
          dueDate: '2026-09-01T00:00:00.000Z',
          isOverdue: true,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    expect(result.right.items).toHaveLength(1)
    expect(result.right.items[0].isOverdue).toBe(true)
    expect(result.right.total).toBe(1)
  })

  it('devolve ContractError quando o envelope é inválido', () => {
    const result = toReceivableList({ data: 'nope' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
