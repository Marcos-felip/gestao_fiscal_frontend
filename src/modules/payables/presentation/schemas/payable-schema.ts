import { dateBrToIso, parseDecimal } from '@/shared/ui/utils/masks'

/** Formulário de criação de título avulso (valores como string p/ os inputs). */
export interface CreatePayableFormValues {
  description: string
  totalAmount: string
  dueDate: string
  installments: string
  intervalDays: string
  category: string
}

export interface CreatePayableErrors {
  description?: string
  totalAmount?: string
  dueDate?: string
}

export interface CreatePayableValidation {
  errors: CreatePayableErrors
  ok: boolean
}

export function validateCreatePayable(
  values: CreatePayableFormValues,
): CreatePayableValidation {
  const errors: CreatePayableErrors = {}

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

/** Formulário de baixa (pagamento) de um título. */
export interface PayPayableFormValues {
  amount: string
  method: string
  notes: string
}

export interface PayPayableErrors {
  amount?: string
}

export interface PayPayableValidation {
  errors: PayPayableErrors
  ok: boolean
}

/** Valida o pagamento contra o saldo em aberto do título. */
export function validatePayPayable(
  values: PayPayableFormValues,
  balance: number,
): PayPayableValidation {
  const errors: PayPayableErrors = {}

  const amount = parseDecimal(values.amount)
  if (amount === undefined || amount <= 0) {
    errors.amount = 'Valor deve ser maior que zero'
  } else if (amount > balance + 0.001) {
    errors.amount = 'Valor excede o saldo do título'
  }

  return { errors, ok: Object.keys(errors).length === 0 }
}
