export const SaleStatus = {
  ORCAMENTO: 'ORCAMENTO',
  EM_ABERTO: 'EM_ABERTO',
  CONCLUIDA: 'CONCLUIDA',
  CANCELADA: 'CANCELADA',
} as const

export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus]

export const saleStatusLabels: Record<SaleStatus, string> = {
  ORCAMENTO: 'Orçamento',
  EM_ABERTO: 'Em aberto',
  CONCLUIDA: 'Concluída',
  CANCELADA: 'Cancelada',
}

export const saleStatusOptions: { value: SaleStatus; label: string }[] = [
  { value: SaleStatus.ORCAMENTO, label: saleStatusLabels.ORCAMENTO },
  { value: SaleStatus.EM_ABERTO, label: saleStatusLabels.EM_ABERTO },
  { value: SaleStatus.CONCLUIDA, label: saleStatusLabels.CONCLUIDA },
  { value: SaleStatus.CANCELADA, label: saleStatusLabels.CANCELADA },
]
