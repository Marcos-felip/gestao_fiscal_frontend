import type { CashMovementType } from '@/enums/cash-movement-type.enum'

/** Sangria/suprimento (`POST /cash-sessions/:id/movements`). `amount` positivo. */
export class CreateCashMovementDto {
  type: CashMovementType
  amount: number
  reason?: string

  constructor(fields: {
    type: CashMovementType
    amount: number
    reason?: string
  }) {
    this.type = fields.type
    this.amount = fields.amount
    this.reason = fields.reason
  }
}
