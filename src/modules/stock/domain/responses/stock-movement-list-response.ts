import type { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'

export interface StockMovementList {
  items: StockMovement[]
  total: number
  page: number
  limit: number
}
