export const PaymentMethod = {
  DINHEIRO: 'DINHEIRO',
  CARTAO_CREDITO: 'CARTAO_CREDITO',
  CARTAO_DEBITO: 'CARTAO_DEBITO',
  PIX: 'PIX',
  BOLETO: 'BOLETO',
  OUTRO: 'OUTRO',
} as const

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod]

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  DINHEIRO: 'Dinheiro',
  CARTAO_CREDITO: 'Cartão de crédito',
  CARTAO_DEBITO: 'Cartão de débito',
  PIX: 'PIX',
  BOLETO: 'Boleto',
  OUTRO: 'Outro',
}

export const paymentMethodOptions: { value: PaymentMethod; label: string }[] = [
  { value: PaymentMethod.DINHEIRO, label: paymentMethodLabels.DINHEIRO },
  {
    value: PaymentMethod.CARTAO_CREDITO,
    label: paymentMethodLabels.CARTAO_CREDITO,
  },
  {
    value: PaymentMethod.CARTAO_DEBITO,
    label: paymentMethodLabels.CARTAO_DEBITO,
  },
  { value: PaymentMethod.PIX, label: paymentMethodLabels.PIX },
  { value: PaymentMethod.BOLETO, label: paymentMethodLabels.BOLETO },
  { value: PaymentMethod.OUTRO, label: paymentMethodLabels.OUTRO },
]
