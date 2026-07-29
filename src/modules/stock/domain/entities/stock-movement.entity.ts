import type { StockMovementType } from '@/enums/stock-movement-type.enum'
import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'

export class StockMovement {
  readonly id: string
  readonly companyId: string
  readonly productId: string
  readonly productName: string | null
  readonly productUnit: UnitOfMeasure | null
  readonly type: StockMovementType
  readonly quantity: number
  readonly reason: string | null
  readonly referenceId: string | null
  readonly createdAt: string | null

  constructor(
    id: string,
    companyId: string,
    productId: string,
    productName: string | null,
    productUnit: UnitOfMeasure | null,
    type: StockMovementType,
    quantity: number,
    reason: string | null,
    referenceId: string | null,
    createdAt: string | null,
  ) {
    this.id = id
    this.companyId = companyId
    this.productId = productId
    this.productName = productName
    this.productUnit = productUnit
    this.type = type
    this.quantity = quantity
    this.reason = reason
    this.referenceId = referenceId
    this.createdAt = createdAt
  }

  /** Origem automática (compra) quando há referência a outro documento. */
  get isAutomatic(): boolean {
    return this.referenceId !== null
  }
}
