import { parseDecimal } from '@/shared/ui/utils/masks'

/** Formulário de sangria/suprimento. */
export interface CashMovementFormValues {
  amount: string
  reason: string
}

export interface CashMovementErrors {
  amount?: string
}

export interface CashMovementValidation {
  errors: CashMovementErrors
  ok: boolean
}

export function validateCashMovement(
  values: CashMovementFormValues,
): CashMovementValidation {
  const errors: CashMovementErrors = {}

  const amount = parseDecimal(values.amount)
  if (amount === undefined || amount <= 0) {
    errors.amount = 'Valor deve ser maior que zero'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}
