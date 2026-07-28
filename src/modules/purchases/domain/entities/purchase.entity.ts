import type { PurchaseStatus } from '@/enums/purchase-status.enum'
import type { PurchaseItem } from '@/modules/purchases/domain/entities/purchase-item.entity'

export class Purchase {
  readonly id: string
  readonly companyId: string
  readonly establishmentId: string
  readonly establishmentName: string | null
  readonly supplierId: string | null
  readonly supplierName: string | null
  readonly status: PurchaseStatus
  readonly purchaseNumber: number
  readonly totalAmount: number
  readonly notes: string | null
  readonly purchaseDate: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null
  readonly items: PurchaseItem[]

  constructor(
    id: string,
    companyId: string,
    establishmentId: string,
    establishmentName: string | null,
    supplierId: string | null,
    supplierName: string | null,
    status: PurchaseStatus,
    purchaseNumber: number,
    totalAmount: number,
    notes: string | null,
    purchaseDate: string | null,
    createdAt: string | null,
    updatedAt: string | null,
    items: PurchaseItem[],
  ) {
    this.id = id
    this.companyId = companyId
    this.establishmentId = establishmentId
    this.establishmentName = establishmentName
    this.supplierId = supplierId
    this.supplierName = supplierName
    this.status = status
    this.purchaseNumber = purchaseNumber
    this.totalAmount = totalAmount
    this.notes = notes
    this.purchaseDate = purchaseDate
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.items = items
  }

  get itemsCount(): number {
    return this.items.length
  }
}
