import type { StockMovementType } from '@/core/enums/stock-movement-type.enum'

export class CreateStockMovementDto {
  productId: string
  type: StockMovementType
  quantity: number
  reason?: string

  constructor(fields: {
    productId: string
    type: StockMovementType
    quantity: number
    reason?: string
  }) {
    this.productId = fields.productId
    this.type = fields.type
    this.quantity = fields.quantity
    this.reason = fields.reason
  }
}
