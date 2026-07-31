import type { PaymentMethod } from '@/enums/payment-method.enum'

/** Uma baixa (pagamento) lançada sobre um título a receber. */
export class ReceivablePayment {
  readonly id: string
  readonly entryId: string
  readonly amount: number
  readonly paidAt: string | null
  readonly method: PaymentMethod | null
  readonly notes: string | null
  readonly createdAt: string | null

  constructor(fields: {
    id: string
    entryId: string
    amount: number
    paidAt: string | null
    method: PaymentMethod | null
    notes: string | null
    createdAt: string | null
  }) {
    this.id = fields.id
    this.entryId = fields.entryId
    this.amount = fields.amount
    this.paidAt = fields.paidAt
    this.method = fields.method
    this.notes = fields.notes
    this.createdAt = fields.createdAt
  }
}
