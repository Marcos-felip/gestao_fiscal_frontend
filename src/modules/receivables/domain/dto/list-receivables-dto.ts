import type { FinancialStatus } from '@/enums/financial-status.enum'

export class ListReceivablesDto {
  page: number
  limit: number
  status?: FinancialStatus
  customerId?: string
  saleId?: string
  overdue?: boolean
  startDate?: string
  endDate?: string

  constructor(fields: {
    page: number
    limit: number
    status?: FinancialStatus
    customerId?: string
    saleId?: string
    overdue?: boolean
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.status = fields.status
    this.customerId = fields.customerId
    this.saleId = fields.saleId
    this.overdue = fields.overdue
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
