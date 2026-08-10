import type { PaymentCondition } from '@/core/enums/payment-condition.enum'

export interface CreatePurchaseItemInput {
  productId: string
  quantity: number
  unitPrice: number
}

export class CreatePurchaseDto {
  establishmentId: string
  items: CreatePurchaseItemInput[]
  supplierId?: string
  paymentCondition?: PaymentCondition
  installments?: number
  firstDueDate?: string
  intervalDays?: number
  notes?: string
  purchaseDate?: string

  constructor(fields: {
    establishmentId: string
    items: CreatePurchaseItemInput[]
    supplierId?: string
    paymentCondition?: PaymentCondition
    installments?: number
    firstDueDate?: string
    intervalDays?: number
    notes?: string
    purchaseDate?: string
  }) {
    this.establishmentId = fields.establishmentId
    this.items = fields.items
    this.supplierId = fields.supplierId
    this.paymentCondition = fields.paymentCondition
    this.installments = fields.installments
    this.firstDueDate = fields.firstDueDate
    this.intervalDays = fields.intervalDays
    this.notes = fields.notes
    this.purchaseDate = fields.purchaseDate
  }
}
