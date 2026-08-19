import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Either } from '@/core/either/either'
import { ServerError } from '@/core/errors/server-error'
import { SalesChartRange } from '@/core/enums/sales-chart-range.enum'
import { usePermissionsStore } from '@/modules/permissions/presentation/stores/permissions-store'
import { DashboardController } from './dashboard-controller'

const period = { count: 3, total: 300, averageTicket: 100 }

const sales = {
  today: period,
  yesterday: period,
  month: period,
  previousMonth: period,
  openQuotes: { count: 0, total: 0 },
}

const chart = {
  range: SalesChartRange.LAST_30_DAYS,
  points: [{ key: '2026-08-19', total: 300, count: 3 }],
}

const financial = {
  overdue: { count: 0, total: 0 },
  dueToday: { count: 0, total: 0 },
  dueNext7Days: { count: 0, total: 0 },
  open: { count: 2, total: 128 },
  settledThisMonth: 64,
}

const fiscal = {
  month: {
    total: 10,
    authorized: 6,
    rejected: 2,
    cancelled: 1,
    pending: 1,
    contingency: 0,
    failed: 0,
  },
  authorizedTotal: 308,
  certificateAlerts: [],
}

const stock = { outOfStock: 3, belowMinimum: 0, items: [] }
const cash = { blindClose: false, closedToday: 0, openSessions: [] }

const ALL = [
  'sales.list',
  'receivables.list',
  'payables.list',
  'fiscal.read',
  'products.list',
  'cash.list',
]

function grant(codes: string[]): void {
  const store = usePermissionsStore()
  store.$patch({ codes: new Set(codes), loaded: true })
}

function build() {
  const useCases = {
    sales: { execute: vi.fn().mockResolvedValue(Either.right(sales)) },
    chart: { execute: vi.fn().mockResolvedValue(Either.right(chart)) },
    receivables: {
      execute: vi.fn().mockResolvedValue(Either.right(financial)),
    },
    payables: { execute: vi.fn().mockResolvedValue(Either.right(financial)) },
    fiscal: { execute: vi.fn().mockResolvedValue(Either.right(fiscal)) },
    stock: { execute: vi.fn().mockResolvedValue(Either.right(stock)) },
    cash: { execute: vi.fn().mockResolvedValue(Either.right(cash)) },
  }

  const controller = new DashboardController(
    useCases.sales as never,
    useCases.chart as never,
    useCases.receivables as never,
    useCases.payables as never,
    useCases.fiscal as never,
    useCases.stock as never,
    useCases.cash as never,
  )

  return { controller, useCases }
}

describe('DashboardController', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('carrega todos os blocos que o usuário pode ver', async () => {
    grant(ALL)
    const { controller } = build()

    await controller.load()

    expect(controller.statusOf('sales')).toBe('ready')
    expect(controller.statusOf('chart')).toBe('ready')
    expect(controller.statusOf('receivables')).toBe('ready')
    expect(controller.statusOf('cash')).toBe('ready')
    expect(controller.sales.value?.month.total).toBe(300)
    expect(controller.fiscal.value?.month.authorized).toBe(6)
  })

  it('não requisita o bloco cuja permissão falta', async () => {
    grant(['sales.list'])
    const { controller, useCases } = build()

    await controller.load()

    expect(useCases.sales.execute).toHaveBeenCalledTimes(1)
    expect(useCases.receivables.execute).not.toHaveBeenCalled()
    expect(useCases.payables.execute).not.toHaveBeenCalled()
    expect(useCases.cash.execute).not.toHaveBeenCalled()

    expect(controller.statusOf('receivables')).toBe('hidden')
    expect(controller.isVisible('receivables')).toBe(false)
    expect(controller.hasError).toBe(false)
  })

  it('isola a falha de um bloco dos demais', async () => {
    grant(ALL)
    const { controller, useCases } = build()
    useCases.receivables.execute.mockResolvedValue(
      Either.left(new ServerError(500, 'caiu')),
    )

    await controller.load()

    expect(controller.statusOf('receivables')).toBe('failed')
    expect(controller.receivables.value).toBeNull()
    expect(controller.statusOf('sales')).toBe('ready')
    expect(controller.sales.value?.today.total).toBe(300)
    expect(controller.hasError).toBe(false)
  })

  it('recarrega só o bloco que falhou', async () => {
    grant(ALL)
    const { controller, useCases } = build()
    useCases.receivables.execute.mockResolvedValueOnce(
      Either.left(new ServerError(500, 'caiu')),
    )

    await controller.load()
    expect(controller.statusOf('receivables')).toBe('failed')

    await controller.retry('receivables')

    expect(controller.statusOf('receivables')).toBe('ready')
    expect(useCases.receivables.execute).toHaveBeenCalledTimes(2)
    expect(useCases.sales.execute).toHaveBeenCalledTimes(1)
  })

  it('troca o período recarregando apenas o gráfico', async () => {
    grant(ALL)
    const { controller, useCases } = build()

    await controller.load()
    await controller.setChartRange(SalesChartRange.LAST_12_MONTHS)

    expect(controller.chartRange.value).toBe(SalesChartRange.LAST_12_MONTHS)
    expect(useCases.chart.execute).toHaveBeenCalledTimes(2)
    expect(useCases.sales.execute).toHaveBeenCalledTimes(1)
    expect(useCases.chart.execute.mock.calls[1][0]).toMatchObject({
      range: SalesChartRange.LAST_12_MONTHS,
    })
  })

  it('ignora a troca para o período que já está selecionado', async () => {
    grant(ALL)
    const { controller, useCases } = build()

    await controller.load()
    await controller.setChartRange(SalesChartRange.LAST_30_DAYS)

    expect(useCases.chart.execute).toHaveBeenCalledTimes(1)
  })

  it('reconhece a empresa sem movimento nenhum', async () => {
    grant(ALL)
    const { controller, useCases } = build()
    const zerado = { count: 0, total: 0, averageTicket: 0 }

    useCases.sales.execute.mockResolvedValue(
      Either.right({
        today: zerado,
        yesterday: zerado,
        month: zerado,
        previousMonth: zerado,
        openQuotes: { count: 0, total: 0 },
      }),
    )
    useCases.receivables.execute.mockResolvedValue(
      Either.right({ ...financial, open: { count: 0, total: 0 } }),
    )
    useCases.payables.execute.mockResolvedValue(
      Either.right({ ...financial, open: { count: 0, total: 0 } }),
    )
    useCases.fiscal.execute.mockResolvedValue(
      Either.right({ ...fiscal, month: { ...fiscal.month, total: 0 } }),
    )
    useCases.stock.execute.mockResolvedValue(
      Either.right({ outOfStock: 0, belowMinimum: 0, items: [] }),
    )

    await controller.load()

    expect(controller.isFresh.value).toBe(true)
  })

  it('não confunde empresa com movimento com empresa nova', async () => {
    grant(ALL)
    const { controller } = build()

    await controller.load()

    expect(controller.isFresh.value).toBe(false)
  })
  it('não declara empresa nova a partir de bloco que o usuário não vê', async () => {
    // Estoquista de uma loja cheia: sem `sales.list`, ele não enxerga o
    // movimento — e ausência de visão não pode virar "sem movimento".
    grant(['products.list'])
    const { controller, useCases } = build()
    useCases.stock.execute.mockResolvedValue(
      Either.right({ outOfStock: 0, belowMinimum: 0, items: [] }),
    )

    await controller.load()

    expect(controller.statusOf('sales')).toBe('hidden')
    expect(controller.isFresh.value).toBe(false)
  })
})
