import { dateBrToIso, parseDecimal } from '@/shared/ui/utils/masks'

/** Formulário de criação de título avulso (valores como string p/ os inputs). */
export interface CreateReceivableFormValues {
  description: string
  customerId: string
  totalAmount: string
  dueDate: string
  installments: string
  intervalDays: string
  category: string
}

export interface CreateReceivableErrors {
  description?: string
  totalAmount?: string
  dueDate?: string
}

export interface CreateReceivableValidation {
  errors: CreateReceivableErrors
  ok: boolean
}

export function validateCreateReceivable(
  values: CreateReceivableFormValues,
): CreateReceivableValidation {
  const errors: CreateReceivableErrors = {}

  if (!values.description.trim()) {
    errors.description = 'Informe uma descrição'
  }

  const amount = parseDecimal(values.totalAmount)
  if (amount === undefined || amount <= 0) {
    errors.totalAmount = 'Valor deve ser maior que zero'
  }

  if (!dateBrToIso(values.dueDate)) {
    errors.dueDate = 'Informe um vencimento válido (dd/mm/aaaa)'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}

/** Formulário de baixa de um título. */
export interface PayReceivableFormValues {
  amount: string
  method: string
  notes: string
}

export interface PayReceivableErrors {
  amount?: string
}

export interface PayReceivableValidation {
  errors: PayReceivableErrors
  ok: boolean
}

/** Valida a baixa contra o saldo em aberto do título. */
export function validatePayReceivable(
  values: PayReceivableFormValues,
  balance: number,
): PayReceivableValidation {
  const errors: PayReceivableErrors = {}

  const amount = parseDecimal(values.amount)
  if (amount === undefined || amount <= 0) {
    errors.amount = 'Valor deve ser maior que zero'
  } else if (amount > balance + 0.001) {
    errors.amount = 'Valor excede o saldo do título'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}
