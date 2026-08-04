import { SaleStatus } from '@/enums/sale-status.enum'
import type { PaymentStatus } from '@/enums/payment-status.enum'
import { FiscalStatus } from '@/enums/fiscal-status.enum'
import type { PaymentMethod } from '@/enums/payment-method.enum'
import type { PaymentCondition } from '@/enums/payment-condition.enum'
import type { SaleItem } from '@/modules/sales/domain/entities/sale-item.entity'
import type { SalePayment } from '@/modules/sales/domain/entities/sale-payment.entity'

export class Sale {
  readonly id: string
  readonly companyId: string
  readonly establishmentId: string
  readonly establishmentName: string | null
  readonly customerId: string | null
  readonly customerName: string | null
  readonly status: SaleStatus
  readonly paymentStatus: PaymentStatus
  readonly fiscalStatus: FiscalStatus
  readonly saleNumber: number
  readonly subtotal: number
  readonly discount: number
  readonly totalAmount: number
  readonly paymentMethod: PaymentMethod | null
  readonly notes: string | null
  readonly saleDate: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null
  readonly items: SaleItem[]
  readonly payments: SalePayment[]
  readonly paymentCondition: PaymentCondition
  /** Id do documento fiscal vinculado, quando a resposta traz a relação. */
  readonly fiscalDocumentId: string | null

  constructor(
    id: string,
    companyId: string,
    establishmentId: string,
    establishmentName: string | null,
    customerId: string | null,
    customerName: string | null,
    status: SaleStatus,
    paymentStatus: PaymentStatus,
    fiscalStatus: FiscalStatus,
    saleNumber: number,
    subtotal: number,
    discount: number,
    totalAmount: number,
    paymentMethod: PaymentMethod | null,
    notes: string | null,
    saleDate: string | null,
    createdAt: string | null,
    updatedAt: string | null,
    items: SaleItem[],
    payments: SalePayment[],
    paymentCondition: PaymentCondition,
    fiscalDocumentId: string | null = null,
  ) {
    this.id = id
    this.companyId = companyId
    this.establishmentId = establishmentId
    this.establishmentName = establishmentName
    this.customerId = customerId
    this.customerName = customerName
    this.status = status
    this.paymentStatus = paymentStatus
    this.fiscalStatus = fiscalStatus
    this.saleNumber = saleNumber
    this.subtotal = subtotal
    this.discount = discount
    this.totalAmount = totalAmount
    this.paymentMethod = paymentMethod
    this.notes = notes
    this.saleDate = saleDate
    this.createdAt = createdAt
    this.updatedAt = updatedAt
    this.items = items
    this.payments = payments
    this.paymentCondition = paymentCondition
    this.fiscalDocumentId = fiscalDocumentId
  }

  get itemsCount(): number {
    return this.items.length
  }

  /** Venda concluída cuja NFC-e ainda não foi emitida (fallback manual). */
  get canEmitFiscal(): boolean {
    return (
      this.status === SaleStatus.CONCLUIDA &&
      this.fiscalStatus === FiscalStatus.NAO_EMITIDO
    )
  }
}
