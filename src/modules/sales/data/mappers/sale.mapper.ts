import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Sale } from '@/modules/sales/domain/entities/sale.entity'
import { SaleItem } from '@/modules/sales/domain/entities/sale-item.entity'
import type { SaleList } from '@/modules/sales/domain/responses/sale-list-response'
import type { SaleStatus } from '@/enums/sale-status.enum'
import type { PaymentStatus } from '@/enums/payment-status.enum'
import type { FiscalStatus } from '@/enums/fiscal-status.enum'
import type { PaymentMethod } from '@/enums/payment-method.enum'
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

const saleSchema = z.object({
  id: z.string(),
  companyId: z.string(),
  establishmentId: z.string(),
  establishment: namedRefSchema,
  customerId: z.string().nullable().default(null),
  customer: namedRefSchema,
  status: z.string(),
  paymentStatus: z.string().nullable().default(null),
  fiscalStatus: z.string().nullable().default(null),
  saleNumber: z.number(),
  subtotal: decimal,
  discount: decimal,
  totalAmount: decimal,
  paymentMethod: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  saleDate: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
  items: z.array(itemSchema).default([]),
})

type SalePayload = z.infer<typeof saleSchema>
type ItemPayload = z.infer<typeof itemSchema>

const saleListSchema = z.object({
  data: z.array(saleSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildItem(value: ItemPayload): SaleItem {
  return new SaleItem(
    value.id,
    value.productId,
    value.product?.name ?? null,
    (value.product?.unit ?? null) as UnitOfMeasure | null,
    toNumber(value.quantity),
    toNumber(value.unitPrice),
    toNumber(value.total),
  )
}

function build(value: SalePayload): Sale {
  return new Sale(
    value.id,
    value.companyId,
    value.establishmentId,
    value.establishment?.name ?? null,
    value.customerId,
    value.customer?.name ?? null,
    value.status as SaleStatus,
    (value.paymentStatus ?? 'PENDENTE') as PaymentStatus,
    (value.fiscalStatus ?? 'NAO_EMITIDO') as FiscalStatus,
    value.saleNumber,
    toNumber(value.subtotal),
    toNumber(value.discount),
    toNumber(value.totalAmount),
    (value.paymentMethod ?? null) as PaymentMethod | null,
    value.notes,
    value.saleDate,
    value.createdAt,
    value.updatedAt,
    value.items.map(buildItem),
  )
}

export function toSale(data: unknown): Either<DomainError, Sale> {
  const parsed = saleSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('sales', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

export function toSaleList(data: unknown): Either<DomainError, SaleList> {
  const parsed = saleListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('sales', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
