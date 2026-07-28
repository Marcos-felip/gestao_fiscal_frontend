export const PurchaseStatus = {
  DRAFT: 'DRAFT',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
} as const

export type PurchaseStatus =
  (typeof PurchaseStatus)[keyof typeof PurchaseStatus]

export const purchaseStatusLabels: Record<PurchaseStatus, string> = {
  DRAFT: 'Rascunho',
  CONFIRMED: 'Confirmada',
  CANCELLED: 'Cancelada',
}

export const purchaseStatusOptions: {
  value: PurchaseStatus
  label: string
}[] = [
  { value: PurchaseStatus.DRAFT, label: purchaseStatusLabels.DRAFT },
  { value: PurchaseStatus.CONFIRMED, label: purchaseStatusLabels.CONFIRMED },
  { value: PurchaseStatus.CANCELLED, label: purchaseStatusLabels.CANCELLED },
]
