import type { CashMovementType } from '@/core/enums/cash-movement-type.enum'

/**
 * Movimento manual da gaveta (sangria/suprimento) durante uma sessão.
 * `amount` é sempre positivo; o efeito no caixa vem do `type`.
 */
export class CashMovement {
  readonly id: string
  readonly sessionId: string | null
  readonly type: CashMovementType
  readonly amount: number
  readonly reason: string | null
  readonly createdById: string | null
  readonly createdByName: string | null
  readonly createdAt: string | null

  constructor(fields: {
    id: string
    sessionId: string | null
    type: CashMovementType
    amount: number
    reason: string | null
    createdById: string | null
    createdByName: string | null
    createdAt: string | null
  }) {
    this.id = fields.id
    this.sessionId = fields.sessionId
    this.type = fields.type
    this.amount = fields.amount
    this.reason = fields.reason
    this.createdById = fields.createdById
    this.createdByName = fields.createdByName
    this.createdAt = fields.createdAt
  }

  /** Sinal do movimento na gaveta: suprimento entra, sangria sai. */
  get signedAmount(): number {
    return this.type === 'SUPRIMENTO' ? this.amount : -this.amount
  }
}
