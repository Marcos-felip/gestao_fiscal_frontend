import { parseDecimal } from '@/shared/ui/utils/masks'

/** Formulário de fechamento (conferência) de caixa. */
export interface CloseCashSessionFormValues {
  countedCash: string
  notes: string
}

export interface CloseCashSessionErrors {
  countedCash?: string
  notes?: string
}

export interface CloseCashSessionValidation {
  errors: CloseCashSessionErrors
  ok: boolean
}

/**
 * `requireNotes` liga quando há diferença entre contado e esperado — o backend
 * exige justificativa nesse caso. No fechamento às cegas a diferença é
 * desconhecida até fechar, então a observação nunca é forçada no cliente.
 */
export function validateCloseCashSession(
  values: CloseCashSessionFormValues,
  requireNotes: boolean,
): CloseCashSessionValidation {
  const errors: CloseCashSessionErrors = {}

  const counted = parseDecimal(values.countedCash)
  if (counted === undefined || counted < 0) {
    errors.countedCash = 'Informe o valor contado (pode ser 0)'
  }

  if (requireNotes && !values.notes.trim()) {
    errors.notes = 'Justifique a diferença de caixa'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}
