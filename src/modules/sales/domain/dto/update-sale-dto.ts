import type { PaymentMethod } from '@/core/enums/payment-method.enum'
import type { SaleStatus } from '@/core/enums/sale-status.enum'
import type { CreateSaleItemInput } from '@/modules/sales/domain/dto/create-sale-dto'

/** Status permitidos ao atualizar (backend só aceita orçamento/em aberto). */
export type UpdatableSaleStatus =
  | typeof SaleStatus.ORCAMENTO
  | typeof SaleStatus.EM_ABERTO

export class UpdateSaleDto {
  customerId?: string
  items?: CreateSaleItemInput[]
  discount?: number
  paymentMethod?: PaymentMethod
  notes?: string
  saleDate?: string
  status?: UpdatableSaleStatus

  constructor(fields: {
    customerId?: string
    items?: CreateSaleItemInput[]
    discount?: number
    paymentMethod?: PaymentMethod
    notes?: string
    saleDate?: string
    status?: UpdatableSaleStatus
  }) {
    this.customerId = fields.customerId
    this.items = fields.items
    this.discount = fields.discount
    this.paymentMethod = fields.paymentMethod
    this.notes = fields.notes
    this.saleDate = fields.saleDate
    this.status = fields.status
  }
}
