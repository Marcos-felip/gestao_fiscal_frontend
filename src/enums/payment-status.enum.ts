export const PaymentStatus = {
  PENDENTE: 'PENDENTE',
  APROVADO: 'APROVADO',
  RECUSADO: 'RECUSADO',
  ESTORNADO: 'ESTORNADO',
} as const

export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus]

export const paymentStatusLabels: Record<PaymentStatus, string> = {
  PENDENTE: 'Pendente',
  APROVADO: 'Aprovado',
  RECUSADO: 'Recusado',
  ESTORNADO: 'Estornado',
}

export const paymentStatusOptions: { value: PaymentStatus; label: string }[] = [
  { value: PaymentStatus.PENDENTE, label: paymentStatusLabels.PENDENTE },
  { value: PaymentStatus.APROVADO, label: paymentStatusLabels.APROVADO },
  { value: PaymentStatus.RECUSADO, label: paymentStatusLabels.RECUSADO },
  { value: PaymentStatus.ESTORNADO, label: paymentStatusLabels.ESTORNADO },
]
