/**
 * Movimento manual da gaveta durante uma sessão de caixa.
 *
 * `SANGRIA` retira dinheiro (reduz o esperado em gaveta); `SUPRIMENTO`
 * adiciona (aumenta). O valor é sempre positivo — o sinal vem do tipo.
 */
export const CashMovementType = {
  SANGRIA: 'SANGRIA',
  SUPRIMENTO: 'SUPRIMENTO',
} as const

export type CashMovementType =
  (typeof CashMovementType)[keyof typeof CashMovementType]

export const cashMovementTypeLabels: Record<CashMovementType, string> = {
  SANGRIA: 'Sangria',
  SUPRIMENTO: 'Suprimento',
}

export const cashMovementTypeOptions: {
  value: CashMovementType
  label: string
}[] = [
  { value: CashMovementType.SANGRIA, label: cashMovementTypeLabels.SANGRIA },
  {
    value: CashMovementType.SUPRIMENTO,
    label: cashMovementTypeLabels.SUPRIMENTO,
  },
]
