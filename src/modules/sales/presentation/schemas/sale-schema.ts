import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { parseDecimal } from '@/shared/ui/utils/masks'

/** Produto disponível no PDV (view model para o seletor e o carrinho). */
export interface SaleProductOption {
  id: string
  name: string
  unit: UnitOfMeasure | null
  sku: string | null
  barcode: string | null
  salePrice: number | null
  currentStock: number
}

/** Uma linha do carrinho (valores como string para o binding dos inputs). */
export interface SaleItemRow {
  productId: string
  name: string
  unit: UnitOfMeasure | null
  quantity: string
  unitPrice: string
}

export interface SaleFormValues {
  establishmentId: string
  customerId: string
  paymentMethod: string
  /** 'A_VISTA' | 'A_PRAZO' — string para o binding do seletor. */
  paymentCondition: string
  /** Nº de parcelas (só relevante quando a prazo); string do input. */
  installments: string
  /** 1º vencimento (aaaa-MM-dd do DatePicker); vazio = padrão do backend. */
  firstDueDate: string
  /** Dias entre parcelas; string do input, vazio = 30 no backend. */
  intervalDays: string
  discount: string
  notes: string
  items: SaleItemRow[]
}

export interface SaleFormErrors {
  establishmentId?: string
  items?: string
}

export interface SaleItemErrors {
  quantity?: string
  unitPrice?: string
}

export interface SaleValidationResult {
  errors: SaleFormErrors
  itemErrors: SaleItemErrors[]
  ok: boolean
}

/**
 * Valida o carrinho do PDV. Como os itens são aninhados (produto + quantidade
 * + preço por linha), a validação é manual e devolve erros por linha, evitando
 * o mapeamento de caminho `items.0.campo` do Zod.
 *
 * Regras: estabelecimento obrigatório, ao menos um item, quantidade > 0 e
 * preço unitário >= 0 (venda pode ter item promocional a zero).
 */
export function validateSale(values: SaleFormValues): SaleValidationResult {
  const errors: SaleFormErrors = {}
  const itemErrors: SaleItemErrors[] = []
  let ok = true

  if (!values.establishmentId) {
    errors.establishmentId = 'Selecione o estabelecimento'
    ok = false
  }

  if (values.items.length === 0) {
    errors.items = 'Adicione ao menos um item à venda'
    ok = false
  }

  for (const item of values.items) {
    const rowError: SaleItemErrors = {}

    const quantity = parseDecimal(item.quantity)
    if (quantity === undefined || quantity <= 0) {
      rowError.quantity = 'Qtd. inválida'
    }

    const unitPrice = parseDecimal(item.unitPrice)
    if (unitPrice === undefined || unitPrice < 0) {
      rowError.unitPrice = 'Preço inválido'
    }

    if (Object.keys(rowError).length > 0) ok = false
    itemErrors.push(rowError)
  }

  return { errors, itemErrors, ok }
}
