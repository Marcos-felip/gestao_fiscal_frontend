export const SalesChartRange = {
  LAST_30_DAYS: '30d',
  LAST_12_MONTHS: '12m',
} as const

export type SalesChartRange =
  (typeof SalesChartRange)[keyof typeof SalesChartRange]

export const salesChartRangeLabels: Record<SalesChartRange, string> = {
  '30d': '30 dias',
  '12m': '12 meses',
}
