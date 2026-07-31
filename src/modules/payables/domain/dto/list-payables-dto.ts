import type { FinancialStatus } from '@/enums/financial-status.enum'

export class ListPayablesDto {
  page: number
  limit: number
  status?: FinancialStatus
  supplierId?: string
  purchaseId?: string
  overdue?: boolean
  startDate?: string
  endDate?: string

  constructor(fields: {
    page: number
    limit: number
    status?: FinancialStatus
    supplierId?: string
    purchaseId?: string
    overdue?: boolean
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.status = fields.status
    this.supplierId = fields.supplierId
    this.purchaseId = fields.purchaseId
    this.overdue = fields.overdue
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
