export const CashSessionStatus = {
  ABERTA: 'ABERTA',
  FECHADA: 'FECHADA',
} as const

export type CashSessionStatus =
  (typeof CashSessionStatus)[keyof typeof CashSessionStatus]

export const cashSessionStatusLabels: Record<CashSessionStatus, string> = {
  ABERTA: 'Aberta',
  FECHADA: 'Fechada',
}

export const cashSessionStatusOptions: {
  value: CashSessionStatus
  label: string
}[] = [
  { value: CashSessionStatus.ABERTA, label: cashSessionStatusLabels.ABERTA },
  { value: CashSessionStatus.FECHADA, label: cashSessionStatusLabels.FECHADA },
]
