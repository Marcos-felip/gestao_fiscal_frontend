import type { SalesChartRange } from '@/core/enums/sales-chart-range.enum'

export class GetSalesChartDto {
  readonly range: SalesChartRange

  constructor(params: { range: SalesChartRange }) {
    this.range = params.range
  }
}
