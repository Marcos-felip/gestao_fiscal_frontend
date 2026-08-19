/** Um recorte de tempo do faturamento. */
export interface PeriodSales {
  count: number
  total: number
  averageTicket: number
}

/**
 * Faturamento por recorte.
 *
 * Só vendas concluídas somam. `openQuotes` é funil — orçamento e venda em
 * digitação —, nunca receita.
 */
export interface DashboardSales {
  today: PeriodSales
  yesterday: PeriodSales
  month: PeriodSales
  previousMonth: PeriodSales
  openQuotes: { count: number; total: number }
}
