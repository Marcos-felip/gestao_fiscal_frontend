import type { PaymentMethod } from '@/core/enums/payment-method.enum'
import type { PaymentCondition } from '@/core/enums/payment-condition.enum'

export interface CreateSaleItemInput {
  productId: string
  quantity: number
  unitPrice: number
}

/** Uma forma de pagamento de venda à vista (parte de um pagamento dividido). */
export interface CreateSalePaymentInput {
  method: PaymentMethod
  amount: number
  /** Só no DINHEIRO: valor entregue pelo cliente, para o backend calcular o troco. */
  amountReceived?: number
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
  /** Formas de pagamento — exigido ao finalizar uma venda à vista. */
  payments?: CreateSalePaymentInput[]
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
    payments?: CreateSalePaymentInput[]
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
    this.payments = fields.payments
    this.notes = fields.notes
    this.saleDate = fields.saleDate
    this.confirm = fields.confirm
  }
}
