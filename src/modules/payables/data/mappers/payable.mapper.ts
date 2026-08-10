import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Payable } from '@/modules/payables/domain/entities/payable.entity'
import { PayablePayment } from '@/modules/payables/domain/entities/payable-payment.entity'
import type { PayableList } from '@/modules/payables/domain/responses/payable-list-response'
import type { FinancialStatus } from '@/core/enums/financial-status.enum'
import type { FinancialType } from '@/core/enums/financial-type.enum'
import type { PaymentMethod } from '@/core/enums/payment-method.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const decimal = z.union([z.number(), z.string()]).default(0)

const partnerRefSchema = z
  .object({ id: z.string(), name: z.string().nullable().default(null) })
  .nullable()
  .default(null)

const purchaseRefSchema = z
  .object({
    id: z.string(),
    purchaseNumber: z.number().nullable().default(null),
  })
  .nullable()
  .default(null)

const paymentSchema = z.object({
  id: z.string(),
  entryId: z.string(),
  amount: decimal,
  paidAt: z.string().nullable().default(null),
  method: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
})

const payableSchema = z.object({
  id: z.string(),
  establishmentId: z.string().nullable().default(null),
  type: z.string().default('PAGAR'),
  status: z.string(),
  partnerId: z.string().nullable().default(null),
  partner: partnerRefSchema,
  purchaseId: z.string().nullable().default(null),
  purchase: purchaseRefSchema,
  category: z.string().nullable().default(null),
  description: z.string(),
  amount: decimal,
  paidAmount: decimal,
  issueDate: z.string().nullable().default(null),
  dueDate: z.string().nullable().default(null),
  installmentNumber: z.number().default(1),
  installmentTotal: z.number().default(1),
  paymentMethod: z.string().nullable().default(null),
  notes: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
  isOverdue: z.boolean().default(false),
  payments: z.array(paymentSchema).default([]),
})

const payableListSchema = z.object({
  data: z.array(payableSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

type PayablePayload = z.infer<typeof payableSchema>
type PaymentPayload = z.infer<typeof paymentSchema>

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildPayment(value: PaymentPayload): PayablePayment {
  return new PayablePayment({
    id: value.id,
    entryId: value.entryId,
    amount: toNumber(value.amount),
    paidAt: value.paidAt,
    method: (value.method ?? null) as PaymentMethod | null,
    notes: value.notes,
    createdAt: value.createdAt,
  })
}

function build(value: PayablePayload): Payable {
  return new Payable({
    id: value.id,
    establishmentId: value.establishmentId,
    type: value.type as FinancialType,
    status: value.status as FinancialStatus,
    partnerId: value.partnerId,
    supplierName: value.partner?.name ?? null,
    purchaseId: value.purchaseId,
    purchaseNumber: value.purchase?.purchaseNumber ?? null,
    category: value.category,
    description: value.description,
    amount: toNumber(value.amount),
    paidAmount: toNumber(value.paidAmount),
    issueDate: value.issueDate,
    dueDate: value.dueDate,
    installmentNumber: value.installmentNumber,
    installmentTotal: value.installmentTotal,
    paymentMethod: (value.paymentMethod ?? null) as PaymentMethod | null,
    notes: value.notes,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    isOverdue: value.isOverdue,
    payments: value.payments.map(buildPayment),
  })
}

export function toPayable(data: unknown): Either<DomainError, Payable> {
  const parsed = payableSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('payables', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

/** `POST /payables` devolve as parcelas geradas como um array cru. */
export function toPayableArray(data: unknown): Either<DomainError, Payable[]> {
  const parsed = z.array(payableSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('payables', toIssueList(parsed.error)))
  }

  return Either.right(parsed.data.map(build))
}

export function toPayableList(data: unknown): Either<DomainError, PayableList> {
  const parsed = payableListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('payables', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
