import type { SalesChartRange } from '@/core/enums/sales-chart-range.enum'

/** Um ponto do eixo. `key` é `AAAA-MM-DD` na série diária e `AAAA-MM` na mensal. */
export interface SalesChartPoint {
  key: string
  total: number
  count: number
}

export interface DashboardSalesChart {
  range: SalesChartRange
  points: SalesChartPoint[]
}
