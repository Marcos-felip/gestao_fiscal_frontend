import type { FiscalPaymentCode } from '@/core/enums/fiscal-payment-code.enum'

/** Pagamento informado na emissão manual da NFC-e. */
export interface EmitNfcePayment {
  code: FiscalPaymentCode
  amount: number
}

/** Dados para emitir uma NFC-e a partir de uma venda. */
export class EmitNfceDto {
  saleId: string
  establishmentId?: string
  idempotencyKey?: string
  payments?: EmitNfcePayment[]

  constructor(fields: {
    saleId: string
    establishmentId?: string
    idempotencyKey?: string
    payments?: EmitNfcePayment[]
  }) {
    this.saleId = fields.saleId
    this.establishmentId = fields.establishmentId
    this.idempotencyKey = fields.idempotencyKey
    this.payments = fields.payments
  }
}
