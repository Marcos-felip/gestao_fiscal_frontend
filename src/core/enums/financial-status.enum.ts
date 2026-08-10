/**
 * Situação de um título financeiro (conta a receber/pagar).
 *
 * `VENCIDO` existe no enum do backend, mas nunca é gravado — o vencimento é
 * derivado em tempo de leitura no booleano `isOverdue`. Por isso ele não entra
 * em `financialStatusOptions` (filtrar por VENCIDO não retornaria nada); use o
 * filtro de vencidos (`overdue`) para isso.
 */
export const FinancialStatus = {
  ABERTO: 'ABERTO',
  PARCIAL: 'PARCIAL',
  PAGO: 'PAGO',
  VENCIDO: 'VENCIDO',
  CANCELADO: 'CANCELADO',
} as const

export type FinancialStatus =
  (typeof FinancialStatus)[keyof typeof FinancialStatus]

export const financialStatusLabels: Record<FinancialStatus, string> = {
  ABERTO: 'Em aberto',
  PARCIAL: 'Parcial',
  PAGO: 'Pago',
  VENCIDO: 'Vencido',
  CANCELADO: 'Cancelado',
}

export const financialStatusOptions: {
  value: FinancialStatus
  label: string
}[] = [
  { value: FinancialStatus.ABERTO, label: financialStatusLabels.ABERTO },
  { value: FinancialStatus.PARCIAL, label: financialStatusLabels.PARCIAL },
  { value: FinancialStatus.PAGO, label: financialStatusLabels.PAGO },
  { value: FinancialStatus.CANCELADO, label: financialStatusLabels.CANCELADO },
]
