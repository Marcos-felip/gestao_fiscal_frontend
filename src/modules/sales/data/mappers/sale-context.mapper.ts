import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import type {
  SaleContext,
  SaleContextProduct,
} from '@/modules/sales/domain/responses/sale-context-response'
import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const decimal = z.union([z.number(), z.string()])

const refSchema = z.object({ id: z.string(), name: z.string() })

const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  sku: z.string().nullable().default(null),
  barcode: z.string().nullable().default(null),
  unit: z.string().nullable().default(null),
  salePrice: decimal.nullable().default(null),
  currentStock: decimal.default(0),
})

const contextSchema = z.object({
  establishments: z.array(refSchema).default([]),
  customers: z.array(refSchema).default([]),
  products: z.array(productSchema).default([]),
})

type ProductPayload = z.infer<typeof productSchema>

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toNumberOrNull(value: number | string | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function buildProduct(value: ProductPayload): SaleContextProduct {
  return {
    id: value.id,
    name: value.name,
    sku: value.sku,
    barcode: value.barcode,
    unit: (value.unit ?? null) as UnitOfMeasure | null,
    salePrice: toNumberOrNull(value.salePrice),
    currentStock: toNumber(value.currentStock),
  }
}

export function toSaleContext(data: unknown): Either<DomainError, SaleContext> {
  const parsed = contextSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('sales', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    establishments: value.establishments,
    customers: value.customers,
    products: value.products.map(buildProduct),
  })
}
