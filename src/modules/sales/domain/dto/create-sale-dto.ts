import type { PaymentMethod } from '@/enums/payment-method.enum'

export interface CreateSaleItemInput {
  productId: string
  quantity: number
  unitPrice: number
}

export class CreateSaleDto {
  establishmentId: string
  items: CreateSaleItemInput[]
  customerId?: string
  discount?: number
  paymentMethod?: PaymentMethod
  notes?: string
  saleDate?: string
  confirm?: boolean

  constructor(fields: {
    establishmentId: string
    items: CreateSaleItemInput[]
    customerId?: string
    discount?: number
    paymentMethod?: PaymentMethod
    notes?: string
    saleDate?: string
    confirm?: boolean
  }) {
    this.establishmentId = fields.establishmentId
    this.items = fields.items
    this.customerId = fields.customerId
    this.discount = fields.discount
    this.paymentMethod = fields.paymentMethod
    this.notes = fields.notes
    this.saleDate = fields.saleDate
    this.confirm = fields.confirm
  }
}
