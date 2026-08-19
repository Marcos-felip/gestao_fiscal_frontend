export const PaymentCondition = {
  A_VISTA: 'A_VISTA',
  A_PRAZO: 'A_PRAZO',
} as const

export type PaymentCondition =
  (typeof PaymentCondition)[keyof typeof PaymentCondition]

export const paymentConditionLabels: Record<PaymentCondition, string> = {
  A_VISTA: 'À vista',
  A_PRAZO: 'A prazo',
}

export const paymentConditionOptions: {
  value: PaymentCondition
  label: string
}[] = [
  { value: PaymentCondition.A_VISTA, label: paymentConditionLabels.A_VISTA },
  { value: PaymentCondition.A_PRAZO, label: paymentConditionLabels.A_PRAZO },
]
