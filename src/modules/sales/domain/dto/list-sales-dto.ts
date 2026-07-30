import type { SaleStatus } from '@/enums/sale-status.enum'
import type { PaymentStatus } from '@/enums/payment-status.enum'
import type { FiscalStatus } from '@/enums/fiscal-status.enum'

export class ListSalesDto {
  page: number
  limit: number
  status?: SaleStatus
  paymentStatus?: PaymentStatus
  fiscalStatus?: FiscalStatus
  customerId?: string
  establishmentId?: string
  startDate?: string
  endDate?: string

  constructor(fields: {
    page: number
    limit: number
    status?: SaleStatus
    paymentStatus?: PaymentStatus
    fiscalStatus?: FiscalStatus
    customerId?: string
    establishmentId?: string
    startDate?: string
    endDate?: string
  }) {
    this.page = fields.page
    this.limit = fields.limit
    this.status = fields.status
    this.paymentStatus = fields.paymentStatus
    this.fiscalStatus = fields.fiscalStatus
    this.customerId = fields.customerId
    this.establishmentId = fields.establishmentId
    this.startDate = fields.startDate
    this.endDate = fields.endDate
  }
}
