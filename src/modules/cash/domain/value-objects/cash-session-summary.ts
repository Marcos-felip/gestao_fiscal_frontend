import type { PaymentMethod } from '@/enums/payment-method.enum'

export interface PaymentBreakdownItem {
  method: PaymentMethod
  amount: number
}

/**
 * Resumo calculado da sessão (números, não decimais-string). A conferência é só
 * de dinheiro: `expectedCash = openingAmount + cashSales + supplies - withdrawals`.
 * Cartão/PIX entram apenas como informação em `paymentBreakdown`.
 *
 * No fechamento às cegas com a sessão ainda aberta, o backend devolve `null` em
 * `cashSales`, `expectedCash`, `salesTotal`, `paymentBreakdown` e `creditTotal`,
 * e marca `blind: true` — o operador só vê esses números depois de fechar.
 */
export interface CashSessionSummary {
  openingAmount: number
  cashSales: number | null
  supplies: number
  withdrawals: number
  expectedCash: number | null
  countedCash: number | null
  difference: number | null
  salesCount: number
  salesTotal: number | null
  paymentBreakdown: PaymentBreakdownItem[] | null
  creditTotal: number | null
  blind: boolean
}
