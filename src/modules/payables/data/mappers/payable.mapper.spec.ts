import { describe, expect, it } from 'vitest'
import {
  toPayable,
  toPayableArray,
  toPayableList,
} from '@/modules/payables/data/mappers/payable.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toPayable', () => {
  it('mapeia o título, achata fornecedor/compra e converte decimais-string', () => {
    const result = toPayable({
      id: 'pay-1',
      establishmentId: 'est-1',
      type: 'PAGAR',
      status: 'PARCIAL',
      partnerId: 'forn-1',
      partner: { id: 'forn-1', name: 'Fornecedor X' },
      purchaseId: 'pur-1',
      purchase: { id: 'pur-1', purchaseNumber: 7 },
      description: 'Compra #7 (1/3)',
      amount: '100.00',
      paidAmount: '30',
      dueDate: '2026-08-30T00:00:00.000Z',
      installmentNumber: 1,
      installmentTotal: 3,
      isOverdue: false,
      payments: [
        {
          id: 'p-1',
          entryId: 'pay-1',
          amount: '30',
          paidAt: '2026-08-01T00:00:00.000Z',
          method: 'PIX',
          notes: null,
          createdAt: '2026-08-01T00:00:00.000Z',
        },
      ],
    })

    expect(result.isRight).toBe(true)
    const pay = result.right
    expect(pay.supplierName).toBe('Fornecedor X')
    expect(pay.purchaseNumber).toBe(7)
    expect(pay.amount).toBe(100)
    expect(pay.paidAmount).toBe(30)
    expect(pay.balance).toBe(70)
    expect(pay.installmentLabel).toBe('1/3')
    expect(pay.canPay).toBe(true)
    expect(pay.payments[0].amount).toBe(30)
    expect(pay.payments[0].method).toBe('PIX')
  })

  it('aplica defaults quando faltam relações e listas', () => {
    const result = toPayable({
      id: 'pay-2',
      status: 'ABERTO',
      description: 'Título avulso',
      amount: '50',
      dueDate: '2026-09-01T00:00:00.000Z',
    })

    expect(result.isRight).toBe(true)
    const pay = result.right
    expect(pay.supplierName).toBeNull()
    expect(pay.purchaseNumber).toBeNull()
    expect(pay.paidAmount).toBe(0)
    expect(pay.balance).toBe(50)
    expect(pay.installmentLabel).toBe('1/1')
    expect(pay.payments).toEqual([])
  })

  it('reflete quitação e cancelamento nos getters de ação', () => {
    const paid = toPayable({
      id: 'pay-3',
      status: 'PAGO',
      description: 'Quitado',
      amount: '10',
      paidAmount: '10',
      dueDate: '2026-09-01T00:00:00.000Z',
    }).right
    expect(paid.isPaid).toBe(true)
    expect(paid.canPay).toBe(false)
    expect(paid.canCancel).toBe(false)

    const cancelled = toPayable({
      id: 'pay-4',
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
    const result = toPayable({ description: 'Sem id nem status' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toPayableArray', () => {
  it('mapeia as parcelas geradas na criação', () => {
    const result = toPayableArray([
      {
        id: 'pay-1',
        status: 'ABERTO',
        description: 'Título (1/2)',
        amount: '25',
        dueDate: '2026-09-01T00:00:00.000Z',
        installmentNumber: 1,
        installmentTotal: 2,
        isOverdue: false,
      },
      {
        id: 'pay-2',
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

describe('toPayableList', () => {
  it('mapeia a lista paginada', () => {
    const result = toPayableList({
      data: [
        {
          id: 'pay-1',
          status: 'ABERTO',
          description: 'Compra #1 (1/1)',
          amount: '99.9',
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
    expect(result.right.items[0].amount).toBe(99.9)
    expect(result.right.total).toBe(1)
  })

  it('devolve ContractError quando o envelope é inválido', () => {
    const result = toPayableList({ data: 'nope' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
