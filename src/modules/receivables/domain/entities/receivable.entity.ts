import type { FinancialStatus } from '@/enums/financial-status.enum'
import type { FinancialType } from '@/enums/financial-type.enum'
import type { PaymentMethod } from '@/enums/payment-method.enum'
import type { ReceivablePayment } from '@/modules/receivables/domain/entities/receivable-payment.entity'

/**
 * Título a receber — um `FinancialEntry` do tipo RECEBER. Cada parcela de uma
 * venda a prazo (ou um título avulso) é uma instância deste modelo.
 *
 * `isOverdue` vem derivado do backend (o status `VENCIDO` nunca é persistido);
 * `balance`/`canPay`/`canCancel` refletem as regras de baixa e cancelamento.
 */
export class Receivable {
  readonly id: string
  readonly establishmentId: string | null
  readonly type: FinancialType
  readonly status: FinancialStatus
  readonly partnerId: string | null
  readonly customerName: string | null
  readonly saleId: string | null
  readonly saleNumber: number | null
  readonly category: string | null
  readonly description: string
  readonly amount: number
  readonly paidAmount: number
  readonly issueDate: string | null
  readonly dueDate: string | null
  readonly installmentNumber: number
  readonly installmentTotal: number
  readonly paymentMethod: PaymentMethod | null
  readonly notes: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null
  readonly isOverdue: boolean
  readonly payments: ReceivablePayment[]

  constructor(fields: {
    id: string
    establishmentId: string | null
    type: FinancialType
    status: FinancialStatus
    partnerId: string | null
    customerName: string | null
    saleId: string | null
    saleNumber: number | null
    category: string | null
    description: string
    amount: number
    paidAmount: number
    issueDate: string | null
    dueDate: string | null
    installmentNumber: number
    installmentTotal: number
    paymentMethod: PaymentMethod | null
    notes: string | null
    createdAt: string | null
    updatedAt: string | null
    isOverdue: boolean
    payments: ReceivablePayment[]
  }) {
    this.id = fields.id
    this.establishmentId = fields.establishmentId
    this.type = fields.type
    this.status = fields.status
    this.partnerId = fields.partnerId
    this.customerName = fields.customerName
    this.saleId = fields.saleId
    this.saleNumber = fields.saleNumber
    this.category = fields.category
    this.description = fields.description
    this.amount = fields.amount
    this.paidAmount = fields.paidAmount
    this.issueDate = fields.issueDate
    this.dueDate = fields.dueDate
    this.installmentNumber = fields.installmentNumber
    this.installmentTotal = fields.installmentTotal
    this.paymentMethod = fields.paymentMethod
    this.notes = fields.notes
    this.createdAt = fields.createdAt
    this.updatedAt = fields.updatedAt
    this.isOverdue = fields.isOverdue
    this.payments = fields.payments
  }

  /** Saldo em aberto (nunca negativo). */
  get balance(): number {
    return Math.max(0, this.amount - this.paidAmount)
  }

  get isPaid(): boolean {
    return this.status === 'PAGO'
  }

  get isCancelled(): boolean {
    return this.status === 'CANCELADO'
  }

  /** Título parcela `1/3`. */
  get installmentLabel(): string {
    return `${this.installmentNumber}/${this.installmentTotal}`
  }

  /** Pode receber baixa: não cancelado, não quitado e com saldo. */
  get canPay(): boolean {
    return !this.isCancelled && !this.isPaid && this.balance > 0
  }

  /** Pode cancelar: não cancelado e não quitado. */
  get canCancel(): boolean {
    return !this.isCancelled && !this.isPaid
  }
}
