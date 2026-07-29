import type { StockMovementType } from '@/enums/stock-movement-type.enum'

export class ListStockMovementsDto {
  page: number
  limit: number
  productId?: string
  type?: StockMovementType
  startDate?: string
  endDate?: string

  constructor(fields: {
    page: number
    limit: number
    productId?: string
    type?: StockMovementType
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.productId = fields.productId
    this.type = fields.type
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
