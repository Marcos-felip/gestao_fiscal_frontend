import type { PaymentMethod } from '@/enums/payment-method.enum'

export class PayPayableDto {
  amount: number
  paidAt?: string
  method?: PaymentMethod
  notes?: string

  constructor(fields: {
    amount: number
    paidAt?: string
    method?: PaymentMethod
    notes?: string
  }) {
    this.amount = fields.amount
    this.paidAt = fields.paidAt
    this.method = fields.method
    this.notes = fields.notes
  }
}
