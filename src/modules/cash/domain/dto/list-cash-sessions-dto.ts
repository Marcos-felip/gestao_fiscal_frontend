import type { CashSessionStatus } from '@/enums/cash-session-status.enum'

/** Filtros do histórico de sessões (`GET /cash-sessions`), paginado. */
export class ListCashSessionsDto {
  page: number
  limit: number
  status?: CashSessionStatus
  cashRegisterId?: string
  startDate?: string
  endDate?: string

  constructor(fields: {
    page: number
    limit: number
    status?: CashSessionStatus
    cashRegisterId?: string
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.status = fields.status
    this.cashRegisterId = fields.cashRegisterId
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
