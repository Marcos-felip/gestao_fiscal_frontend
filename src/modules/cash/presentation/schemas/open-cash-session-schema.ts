import { parseDecimal } from '@/shared/ui/utils/masks'

/** Formulário de abertura de caixa (valores como string p/ os inputs). */
export interface OpenCashSessionFormValues {
  cashRegisterId: string
  openingAmount: string
}

export interface OpenCashSessionErrors {
  cashRegisterId?: string
  openingAmount?: string
}

export interface OpenCashSessionValidation {
  errors: OpenCashSessionErrors
  ok: boolean
}

export function validateOpenCashSession(
  values: OpenCashSessionFormValues,
): OpenCashSessionValidation {
  const errors: OpenCashSessionErrors = {}

  if (!values.cashRegisterId) {
    errors.cashRegisterId = 'Selecione o caixa'
  }

  const amount = parseDecimal(values.openingAmount)
  if (amount === undefined || amount < 0) {
    errors.openingAmount = 'Informe o fundo de troco (pode ser 0)'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}
