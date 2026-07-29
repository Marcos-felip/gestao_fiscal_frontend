import type { PurchaseStatus } from '@/enums/purchase-status.enum'

export class ListPurchasesDto {
  page: number
  limit: number
  status?: PurchaseStatus
  supplierId?: string
  startDate?: string
  endDate?: string

  constructor(fields: {
    page: number
    limit: number
    status?: PurchaseStatus
    supplierId?: string
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.status = fields.status
    this.supplierId = fields.supplierId
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
