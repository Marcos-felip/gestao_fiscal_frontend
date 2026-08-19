export interface StockAlertItem {
  id: string
  name: string
  sku: string | null
  unit: string
  currentStock: number
  minStock: number | null
}

export interface DashboardStockAlerts {
  outOfStock: number
  belowMinimum: number
  /** Amostra dos mais críticos, não a lista completa. */
  items: StockAlertItem[]
}
