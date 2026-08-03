/** Formulário de cadastro/edição de caixa. */
export interface CashRegisterFormValues {
  establishmentId: string
  name: string
  isActive: boolean
}

export interface CashRegisterErrors {
  establishmentId?: string
  name?: string
}

export interface CashRegisterValidation {
  errors: CashRegisterErrors
  ok: boolean
}

export function validateCashRegister(
  values: CashRegisterFormValues,
  requireEstablishment: boolean,
): CashRegisterValidation {
  const errors: CashRegisterErrors = {}

  if (requireEstablishment && !values.establishmentId) {
    errors.establishmentId = 'Selecione o estabelecimento'
  }
  if (!values.name.trim()) {
    errors.name = 'Informe o nome do caixa'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}
