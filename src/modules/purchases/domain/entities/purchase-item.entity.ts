import type { UnitOfMeasure } from '@/core/enums/unit-of-measure.enum'

export class PurchaseItem {
  readonly id: string
  readonly productId: string
  readonly productName: string | null
  readonly productUnit: UnitOfMeasure | null
  readonly quantity: number
  readonly unitPrice: number
  readonly total: number

  constructor(
    id: string,
    productId: string,
    productName: string | null,
    productUnit: UnitOfMeasure | null,
    quantity: number,
    unitPrice: number,
    total: number,
  ) {
    this.id = id
    this.productId = productId
    this.productName = productName
    this.productUnit = productUnit
    this.quantity = quantity
    this.unitPrice = unitPrice
    this.total = total
  }
}
