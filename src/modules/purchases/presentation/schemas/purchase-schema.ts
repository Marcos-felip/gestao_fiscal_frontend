import { parseDecimal } from '@/shared/ui/utils/masks'

/** Uma linha do editor de itens (valores como string para o binding). */
export interface PurchaseItemRow {
  productId: string
  quantity: string
  unitPrice: string
}

export interface PurchaseFormValues {
  establishmentId: string
  supplierId: string
  purchaseDate: string
  notes: string
  items: PurchaseItemRow[]
}

export interface PurchaseFormErrors {
  establishmentId?: string
  items?: string
}

export interface PurchaseItemErrors {
  productId?: string
  quantity?: string
  unitPrice?: string
}

export interface PurchaseValidationResult {
  errors: PurchaseFormErrors
  itemErrors: PurchaseItemErrors[]
  ok: boolean
}

/**
 * Valida o formulário de compra. Como os itens são aninhados (produto +
 * quantidade + preço por linha), a validação é manual e devolve erros por
 * linha, evitando o mapeamento de caminho `items.0.campo` do Zod.
 */
export function validatePurchase(
  values: PurchaseFormValues,
): PurchaseValidationResult {
  const errors: PurchaseFormErrors = {}
  const itemErrors: PurchaseItemErrors[] = []
  let ok = true

  if (!values.establishmentId) {
    errors.establishmentId = 'Selecione o estabelecimento'
    ok = false
  }

  if (values.items.length === 0) {
    errors.items = 'Adicione ao menos um item'
    ok = false
  }

  for (const item of values.items) {
    const rowError: PurchaseItemErrors = {}
    if (!item.productId) rowError.productId = 'Selecione o produto'

    const quantity = parseDecimal(item.quantity)
    if (quantity === undefined || quantity <= 0) {
      rowError.quantity = 'Qtd. inválida'
    }

    const unitPrice = parseDecimal(item.unitPrice)
    if (unitPrice === undefined || unitPrice <= 0) {
      rowError.unitPrice = 'Preço inválido'
    }

    if (Object.keys(rowError).length > 0) ok = false
    itemErrors.push(rowError)
  }

  return { errors, itemErrors, ok }
}
