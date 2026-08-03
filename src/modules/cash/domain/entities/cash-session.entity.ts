import { CashSessionStatus } from '@/enums/cash-session-status.enum'
import type { CashMovement } from '@/modules/cash/domain/entities/cash-movement.entity'
import type { CashSessionSummary } from '@/modules/cash/domain/value-objects/cash-session-summary'

/**
 * Sessão de caixa: da abertura (com fundo) ao fechamento (com conferência).
 *
 * Os campos monetários do topo (`openingAmount`, `expectedCash`, `countedCash`,
 * `difference`) são os valores persistidos; o `summary` traz o detalhamento
 * calculado (vendas em dinheiro, suprimentos, sangrias, formas de pagamento).
 */
export class CashSession {
  readonly id: string
  readonly establishmentId: string | null
  readonly cashRegisterId: string | null
  readonly cashRegisterName: string | null
  readonly operatorId: string | null
  readonly operatorName: string | null
  readonly status: CashSessionStatus
  readonly openingAmount: number
  readonly openedAt: string | null
  readonly closedAt: string | null
  readonly expectedCash: number | null
  readonly countedCash: number | null
  readonly difference: number | null
  readonly closingNotes: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null
  readonly movements: CashMovement[]
  readonly summary: CashSessionSummary | null

  constructor(fields: {
    id: string
    establishmentId: string | null
    cashRegisterId: string | null
    cashRegisterName: string | null
    operatorId: string | null
    operatorName: string | null
    status: CashSessionStatus
    openingAmount: number
    openedAt: string | null
    closedAt: string | null
    expectedCash: number | null
    countedCash: number | null
    difference: number | null
    closingNotes: string | null
    createdAt: string | null
    updatedAt: string | null
    movements: CashMovement[]
    summary: CashSessionSummary | null
  }) {
    this.id = fields.id
    this.establishmentId = fields.establishmentId
    this.cashRegisterId = fields.cashRegisterId
    this.cashRegisterName = fields.cashRegisterName
    this.operatorId = fields.operatorId
    this.operatorName = fields.operatorName
    this.status = fields.status
    this.openingAmount = fields.openingAmount
    this.openedAt = fields.openedAt
    this.closedAt = fields.closedAt
    this.expectedCash = fields.expectedCash
    this.countedCash = fields.countedCash
    this.difference = fields.difference
    this.closingNotes = fields.closingNotes
    this.createdAt = fields.createdAt
    this.updatedAt = fields.updatedAt
    this.movements = fields.movements
    this.summary = fields.summary
  }

  get isOpen(): boolean {
    return this.status === CashSessionStatus.ABERTA
  }

  get isClosed(): boolean {
    return this.status === CashSessionStatus.FECHADA
  }

  /** Fechamento às cegas com a sessão ainda aberta: esperado escondido. */
  get isBlind(): boolean {
    return this.summary?.blind === true
  }

  /** Diferença relevante (acima de 1 centavo) — exige justificativa. */
  get hasDifference(): boolean {
    return this.difference !== null && Math.abs(this.difference) > 0.01
  }

  /** Faltou dinheiro na gaveta (quebra negativa). */
  get isShort(): boolean {
    return this.difference !== null && this.difference < -0.01
  }

  /** Sobrou dinheiro na gaveta. */
  get isSurplus(): boolean {
    return this.difference !== null && this.difference > 0.01
  }
}
