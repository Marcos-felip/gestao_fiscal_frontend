import { describe, expect, it } from 'vitest'
import { ContractError } from '@/core/errors/contract-error'
import { SalesChartRange } from '@/core/enums/sales-chart-range.enum'
import {
  toDashboardCash,
  toDashboardFinancial,
  toDashboardFiscal,
  toDashboardSales,
  toDashboardSalesChart,
  toDashboardStockAlerts,
} from './dashboard.mapper'

/**
 * O que precisa continuar verdade: dinheiro chega como string e sai número, o
 * `salesTotal` nulo do fechamento às cegas **não** vira zero, e resposta fora do
 * contrato falha como bug nosso (`ContractError`), não como erro do usuário.
 */

const period = { count: 3, total: '300.00', averageTicket: '100.00' }

describe('dashboard.mapper', () => {
  describe('vendas', () => {
    it('coage os decimais em string para número', () => {
      const result = toDashboardSales({
        today: period,
        yesterday: period,
        month: period,
        previousMonth: period,
        openQuotes: { count: 2, total: '820.50' },
      })

      expect(result.isRight).toBe(true)
      expect(result.right.today.total).toBe(300)
      expect(result.right.today.averageTicket).toBe(100)
      expect(result.right.openQuotes.total).toBe(820.5)
    })

    it('recusa resposta fora do contrato como bug nosso', () => {
      const result = toDashboardSales({ today: period })

      expect(result.isLeft).toBe(true)
      expect(result.left).toBeInstanceOf(ContractError)
    })
  })

  describe('gráfico', () => {
    it('preserva os pontos zerados do eixo', () => {
      const result = toDashboardSalesChart({
        range: '30d',
        points: [
          { key: '2026-07-21', total: '0.00', count: 0 },
          { key: '2026-07-22', total: '430.00', count: 5 },
        ],
      })

      expect(result.isRight).toBe(true)
      expect(result.right.range).toBe(SalesChartRange.LAST_30_DAYS)
      expect(result.right.points).toHaveLength(2)
      expect(result.right.points[0].total).toBe(0)
      expect(result.right.points[1].total).toBe(430)
    })

    it('recusa período que o contrato não prevê', () => {
      const result = toDashboardSalesChart({ range: '7d', points: [] })

      expect(result.isLeft).toBe(true)
      expect(result.left).toBeInstanceOf(ContractError)
    })
  })

  describe('financeiro', () => {
    it('lê os saldos em aberto de cada recorte', () => {
      const bucket = (count: number, total: string) => ({ count, total })
      const result = toDashboardFinancial({
        overdue: bucket(3, '1200.00'),
        dueToday: bucket(1, '300.00'),
        dueNext7Days: bucket(5, '2100.00'),
        open: bucket(20, '8000.00'),
        settledThisMonth: '5400.00',
      })

      expect(result.isRight).toBe(true)
      expect(result.right.overdue.total).toBe(1200)
      expect(result.right.open.count).toBe(20)
      expect(result.right.settledThisMonth).toBe(5400)
    })
  })

  describe('fiscal', () => {
    it('lê as contagens do mês e o alerta de certificado', () => {
      const result = toDashboardFiscal({
        month: {
          total: 10,
          authorized: 6,
          rejected: 2,
          cancelled: 1,
          pending: 1,
          contingency: 0,
          failed: 0,
        },
        authorizedTotal: '308.00',
        certificateAlerts: [
          {
            establishmentId: 'est-1',
            establishmentName: 'Matriz',
            expiresAt: '2026-09-08T00:00:00.000Z',
            daysToExpire: 20,
            expired: false,
          },
        ],
      })

      expect(result.isRight).toBe(true)
      expect(result.right.month.authorized).toBe(6)
      expect(result.right.authorizedTotal).toBe(308)
      expect(result.right.certificateAlerts[0].establishmentName).toBe('Matriz')
    })

    it('aceita empresa que ainda não emite, sem alerta nenhum', () => {
      const result = toDashboardFiscal({
        month: {
          total: 0,
          authorized: 0,
          rejected: 0,
          cancelled: 0,
          pending: 0,
          contingency: 0,
          failed: 0,
        },
        authorizedTotal: '0.00',
        certificateAlerts: [],
      })

      expect(result.isRight).toBe(true)
      expect(result.right.certificateAlerts).toEqual([])
    })
  })

  describe('estoque', () => {
    it('mantém nulo o mínimo do produto que não tem mínimo cadastrado', () => {
      const result = toDashboardStockAlerts({
        outOfStock: 3,
        belowMinimum: 0,
        items: [
          {
            id: 'prod-1',
            name: 'Água mineral 1,5L',
            sku: null,
            unit: 'UN',
            currentStock: '0.0000',
            minStock: null,
          },
        ],
      })

      expect(result.isRight).toBe(true)
      expect(result.right.items[0].currentStock).toBe(0)
      expect(result.right.items[0].minStock).toBeNull()
    })
  })

  describe('caixa', () => {
    const session = {
      id: 'sess-1',
      cashRegisterId: 'reg-1',
      cashRegisterName: 'Caixa 1',
      operatorId: 'user-1',
      operatorName: 'Ana',
      openedAt: '2026-08-19T11:00:00.000Z',
      openingAmount: '100.00',
    }

    it('lê o total da sessão quando a empresa não fecha às cegas', () => {
      const result = toDashboardCash({
        blindClose: false,
        closedToday: 2,
        openSessions: [{ ...session, salesTotal: '526.00' }],
      })

      expect(result.isRight).toBe(true)
      expect(result.right.openSessions[0].salesTotal).toBe(526)
    })

    it('preserva nulo no fechamento às cegas — nulo não é zero', () => {
      const result = toDashboardCash({
        blindClose: true,
        closedToday: 0,
        openSessions: [{ ...session, salesTotal: null }],
      })

      expect(result.isRight).toBe(true)
      expect(result.right.blindClose).toBe(true)
      // Se virasse 0, a tela mostraria "R$ 0,00" e diria ao operador que a
      // sessão não vendeu nada — exatamente o oposto do que o nulo significa.
      expect(result.right.openSessions[0].salesTotal).toBeNull()
    })
  })
})
