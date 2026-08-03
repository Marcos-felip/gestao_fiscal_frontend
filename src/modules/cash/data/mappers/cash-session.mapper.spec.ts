import { describe, expect, it } from 'vitest'
import {
  toCashSession,
  toCashSessionOrNull,
  toCashSessionList,
} from '@/modules/cash/data/mappers/cash-session.mapper'
import { ContractError } from '@/core/errors/contract-error'

describe('toCashSession', () => {
  it('converte decimais-string do topo e mantém o summary em number', () => {
    const result = toCashSession({
      id: 'cs-1',
      cashRegisterId: 'cr-1',
      cashRegister: { id: 'cr-1', name: 'Caixa 01' },
      operatorId: 'u-1',
      operator: { id: 'u-1', name: 'Ana' },
      status: 'FECHADA',
      openingAmount: '100.00',
      openedAt: '2026-08-01T08:00:00.000Z',
      closedAt: '2026-08-01T18:00:00.000Z',
      expectedCash: '220.00',
      countedCash: '210.00',
      difference: '-10.00',
      closingNotes: 'Quebra de caixa',
      movements: [
        {
          id: 'mv-1',
          sessionId: 'cs-1',
          type: 'SANGRIA',
          amount: '30.00',
          reason: 'Retirada',
          createdAt: '2026-08-01T12:00:00.000Z',
        },
      ],
      summary: {
        openingAmount: 100,
        cashSales: 150,
        supplies: 0,
        withdrawals: 30,
        expectedCash: 220,
        countedCash: 210,
        difference: -10,
        salesCount: 5,
        salesTotal: 300,
        paymentBreakdown: [
          { method: 'DINHEIRO', amount: 150 },
          { method: 'PIX', amount: 150 },
        ],
        creditTotal: 0,
        blind: false,
      },
    })

    expect(result.isRight).toBe(true)
    const session = result.right
    expect(session.openingAmount).toBe(100)
    expect(session.expectedCash).toBe(220)
    expect(session.difference).toBe(-10)
    expect(session.isClosed).toBe(true)
    expect(session.hasDifference).toBe(true)
    expect(session.isShort).toBe(true)
    expect(session.cashRegisterName).toBe('Caixa 01')
    expect(session.operatorName).toBe('Ana')
    expect(session.movements[0].amount).toBe(30)
    expect(session.movements[0].signedAmount).toBe(-30)
    expect(session.summary?.paymentBreakdown?.[0].method).toBe('DINHEIRO')
  })

  it('trata sessão aberta com fechamento às cegas (summary parcialmente nulo)', () => {
    const result = toCashSession({
      id: 'cs-2',
      status: 'ABERTA',
      openingAmount: '50.00',
      openedAt: '2026-08-02T08:00:00.000Z',
      expectedCash: null,
      countedCash: null,
      difference: null,
      summary: {
        openingAmount: 50,
        cashSales: null,
        supplies: 0,
        withdrawals: 0,
        expectedCash: null,
        countedCash: null,
        difference: null,
        salesCount: 3,
        salesTotal: null,
        paymentBreakdown: null,
        creditTotal: null,
        blind: true,
      },
    })

    expect(result.isRight).toBe(true)
    const session = result.right
    expect(session.isOpen).toBe(true)
    expect(session.isBlind).toBe(true)
    expect(session.expectedCash).toBeNull()
    expect(session.hasDifference).toBe(false)
    expect(session.summary?.salesCount).toBe(3)
    expect(session.summary?.expectedCash).toBeNull()
  })

  it('devolve ContractError quando o payload é inválido', () => {
    const result = toCashSession({ openingAmount: '10' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})

describe('toCashSessionOrNull', () => {
  it('devolve null quando não há sessão aberta', () => {
    expect(toCashSessionOrNull(null).right).toBeNull()
    expect(toCashSessionOrNull('').right).toBeNull()
  })

  it('mapeia a sessão quando presente', () => {
    const result = toCashSessionOrNull({
      id: 'cs-3',
      status: 'ABERTA',
      openingAmount: '80.00',
    })
    expect(result.isRight).toBe(true)
    expect(result.right?.openingAmount).toBe(80)
  })
})

describe('toCashSessionList', () => {
  it('mapeia a página do histórico', () => {
    const result = toCashSessionList({
      data: [{ id: 'cs-1', status: 'FECHADA', openingAmount: '100.00' }],
      total: 1,
      page: 1,
      limit: 20,
    })

    expect(result.isRight).toBe(true)
    expect(result.right.items).toHaveLength(1)
    expect(result.right.total).toBe(1)
  })

  it('devolve ContractError quando o envelope é inválido', () => {
    const result = toCashSessionList({ data: 'nope' })
    expect(result.isLeft).toBe(true)
    expect(result.left).toBeInstanceOf(ContractError)
  })
})
