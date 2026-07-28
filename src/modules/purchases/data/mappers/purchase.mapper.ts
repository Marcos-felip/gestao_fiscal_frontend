import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'
import { PurchaseItem } from '@/modules/purchases/domain/entities/purchase-item.entity'
import type { PurchaseList } from '@/modules/purchases/domain/responses/purchase-list-response'
import type { PurchaseStatus } from '@/enums/purchase-status.enum'
import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const decimal = z.union([z.number(), z.string()]).default(0)

const productRefSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().default(null),
    unit: z.string().nullable().default(null),
  })
  .nullable()
  .default(null)

const itemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  product: productRefSchema,
  quantity: decimal,
  unitPrice: decimal,
  total: decimal,
})

const namedRefSchema = z
  .object({ id: z.string(), name: z.string().nullable().default(null) })
  .nullable()
  .default(null)

const purchaseSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  establishmentId: z.string(),
  establishment: namedRefSchema,
  supplierId: z.string().nullable().default(null),
  supplier: namedRefSchema,
  status: z.string(),
  purchaseNumber: z.number(),
  totalAmount: decimal,
  notes: z.string().nullable().default(null),
  purchaseDate: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
  items: z.array(itemSchema).default([]),
})

type PurchasePayload = z.infer<typeof purchaseSchema>
type ItemPayload = z.infer<typeof itemSchema>

const purchaseListSchema = z.object({
  data: z.array(purchaseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildItem(value: ItemPayload): PurchaseItem {
  return new PurchaseItem(
    value.id,
    value.productId,
    value.product?.name ?? null,
    (value.product?.unit ?? null) as UnitOfMeasure | null,
    toNumber(value.quantity),
    toNumber(value.unitPrice),
    toNumber(value.total),
  )
}

function build(value: PurchasePayload): Purchase {
  return new Purchase(
    value.id,
    value.companyId,
    value.establishmentId,
    value.establishment?.name ?? null,
    value.supplierId,
    value.supplier?.name ?? null,
    value.status as PurchaseStatus,
    value.purchaseNumber,
    toNumber(value.totalAmount),
    value.notes,
    value.purchaseDate,
    value.createdAt,
    value.updatedAt,
    value.items.map(buildItem),
  )
}

export function toPurchase(data: unknown): Either<DomainError, Purchase> {
  const parsed = purchaseSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('purchases', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

export function toPurchaseList(
  data: unknown,
): Either<DomainError, PurchaseList> {
  const parsed = purchaseListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('purchases', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
