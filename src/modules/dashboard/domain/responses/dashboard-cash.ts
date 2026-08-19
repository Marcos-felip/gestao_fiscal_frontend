export interface OpenCashSession {
  id: string
  cashRegisterId: string
  cashRegisterName: string
  operatorId: string
  operatorName: string
  openedAt: string
  openingAmount: number
  /**
   * Nulo quando a empresa fecha o caixa às cegas.
   *
   * Nulo não é zero: é o valor que a conferência às cegas esconde do operador
   * até o fechamento. A tela precisa dizer isso, e não mostrar `R$ 0,00`.
   */
  salesTotal: number | null
}

export interface DashboardCash {
  blindClose: boolean
  openSessions: OpenCashSession[]
  closedToday: number
}
