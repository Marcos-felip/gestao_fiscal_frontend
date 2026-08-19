/** `total` é o saldo em aberto — o que falta receber ou pagar, não o valor de face. */
export interface FinancialBucket {
  count: number
  total: number
}

export interface DashboardFinancial {
  overdue: FinancialBucket
  dueToday: FinancialBucket
  dueNext7Days: FinancialBucket
  open: FinancialBucket
  /** O que foi efetivamente baixado no mês, não o que venceu. */
  settledThisMonth: number
}
