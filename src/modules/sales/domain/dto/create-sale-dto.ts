import type { PaymentMethod } from '@/enums/payment-method.enum'
import type { PaymentCondition } from '@/enums/payment-condition.enum'

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
  paymentCondition?: PaymentCondition
  installments?: number
  firstDueDate?: string
  intervalDays?: number
  notes?: string
  saleDate?: string
  confirm?: boolean

  constructor(fields: {
    establishmentId: string
    items: CreateSaleItemInput[]
    customerId?: string
    discount?: number
    paymentMethod?: PaymentMethod
    paymentCondition?: PaymentCondition
    installments?: number
    firstDueDate?: string
    intervalDays?: number
    notes?: string
    saleDate?: string
    confirm?: boolean
  }) {
    this.establishmentId = fields.establishmentId
    this.items = fields.items
    this.customerId = fields.customerId
    this.discount = fields.discount
    this.paymentMethod = fields.paymentMethod
    this.paymentCondition = fields.paymentCondition
    this.installments = fields.installments
    this.firstDueDate = fields.firstDueDate
    this.intervalDays = fields.intervalDays
    this.notes = fields.notes
    this.saleDate = fields.saleDate
    this.confirm = fields.confirm
  }
}
