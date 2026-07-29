import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import type { StockMovementList } from '@/modules/stock/domain/responses/stock-movement-list-response'
import type { StockMovementType } from '@/enums/stock-movement-type.enum'
import type { UnitOfMeasure } from '@/enums/unit-of-measure.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const decimal = z.union([z.number(), z.string()])

const productRefSchema = z
  .object({
    id: z.string(),
    name: z.string().nullable().default(null),
    unit: z.string().nullable().default(null),
  })
  .nullable()
  .default(null)

const movementSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  productId: z.string(),
  product: productRefSchema,
  type: z.string(),
  quantity: decimal.default(0),
  reason: z.string().nullable().default(null),
  referenceId: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
})

type MovementPayload = z.infer<typeof movementSchema>

const movementListSchema = z.object({
  data: z.array(movementSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function build(value: MovementPayload): StockMovement {
  return new StockMovement(
    value.id,
    value.companyId,
    value.productId,
    value.product?.name ?? null,
    (value.product?.unit ?? null) as UnitOfMeasure | null,
    value.type as StockMovementType,
    toNumber(value.quantity),
    value.reason,
    value.referenceId,
    value.createdAt,
  )
}

export function toStockMovement(
  data: unknown,
): Either<DomainError, StockMovement> {
  const parsed = movementSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('stock', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

export function toStockMovementList(
  data: unknown,
): Either<DomainError, StockMovementList> {
  const parsed = movementListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('stock', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
