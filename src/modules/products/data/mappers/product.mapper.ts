import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Product } from '@/modules/products/domain/entities/product.entity'
import type { ProductList } from '@/modules/products/domain/responses/product-list-response'
import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const decimal = z.union([z.number(), z.string()]).nullable().default(null)

const productSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  name: z.string(),
  description: z.string().nullable().default(null),
  sku: z.string().nullable().default(null),
  barcode: z.string().nullable().default(null),
  unit: z.string().default('UN'),
  costPrice: decimal,
  salePrice: decimal,
  currentStock: decimal,
  minStock: decimal,
  isActive: z.boolean().default(true),
  ncm: z.string().nullable().default(null),
  cest: z.string().nullable().default(null),
  cfop: z.string().nullable().default(null),
  origin: z.number().nullable().default(null),
  csosn: z.string().nullable().default(null),
  cstIcms: z.string().nullable().default(null),
  cstPis: z.string().nullable().default(null),
  cstCofins: z.string().nullable().default(null),
  aliquotaIcms: decimal,
  aliquotaPis: decimal,
  aliquotaCofins: decimal,
  fiscalComplete: z.boolean().default(false),
  technicalAttributes: z.record(z.unknown()).nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
})

type ProductPayload = z.infer<typeof productSchema>

const productListSchema = z.object({
  data: z.array(productSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

/** Converte um Decimal (número|string|null) em number|null. */
function toNumber(value: number | string | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function build(value: ProductPayload): Product {
  return new Product(
    value.id,
    value.companyId,
    value.name,
    value.description,
    value.sku,
    value.barcode,
    value.unit as UnitOfMeasure,
    toNumber(value.costPrice),
    toNumber(value.salePrice),
    toNumber(value.currentStock) ?? 0,
    toNumber(value.minStock),
    value.isActive,
    value.ncm,
    value.cest,
    value.cfop,
    value.origin,
    value.csosn,
    value.cstIcms,
    value.cstPis,
    value.cstCofins,
    toNumber(value.aliquotaIcms),
    toNumber(value.aliquotaPis),
    toNumber(value.aliquotaCofins),
    value.fiscalComplete,
    value.technicalAttributes,
    value.createdAt,
    value.updatedAt,
  )
}

export function toProduct(data: unknown): Either<DomainError, Product> {
  const parsed = productSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('products', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

export function toProductList(data: unknown): Either<DomainError, ProductList> {
  const parsed = productListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('products', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
