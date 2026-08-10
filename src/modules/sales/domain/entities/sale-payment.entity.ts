import type { PaymentMethod } from '@/core/enums/payment-method.enum'

/** Uma forma de pagamento registrada numa venda à vista. */
export class SalePayment {
  readonly id: string
  readonly method: PaymentMethod
  readonly amount: number
  /** Valor entregue em dinheiro (null nas demais formas). */
  readonly amountReceived: number | null
  /** Troco devolvido (null quando não houve). */
  readonly changeGiven: number | null

  constructor(
    id: string,
    method: PaymentMethod,
    amount: number,
    amountReceived: number | null,
    changeGiven: number | null,
  ) {
    this.id = id
    this.method = method
    this.amount = amount
    this.amountReceived = amountReceived
    this.changeGiven = changeGiven
  }
}
