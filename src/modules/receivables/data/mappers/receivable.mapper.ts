import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import { ReceivablePayment } from '@/modules/receivables/domain/entities/receivable-payment.entity'
import type { ReceivableList } from '@/modules/receivables/domain/responses/receivable-list-response'
import type { FinancialStatus } from '@/enums/financial-status.enum'
import type { FinancialType } from '@/enums/financial-type.enum'
import type { PaymentMethod } from '@/enums/payment-method.enum'
import { toIssueList } from '@/core/utils/zod-errors'

const decimal = z.union([z.number(), z.string()]).default(0)

const partnerRefSchema = z
  .object({ id: z.string(), name: z.string().nullable().default(null) })
  .nullable()
  .default(null)

const saleRefSchema = z
  .object({ id: z.string(), saleNumber: z.number().nullable().default(null) })
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

const receivableSchema = z.object({
  id: z.string(),
  establishmentId: z.string().nullable().default(null),
  type: z.string().default('RECEBER'),
  status: z.string(),
  partnerId: z.string().nullable().default(null),
  partner: partnerRefSchema,
  saleId: z.string().nullable().default(null),
  sale: saleRefSchema,
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

const receivableListSchema = z.object({
  data: z.array(receivableSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

type ReceivablePayload = z.infer<typeof receivableSchema>
type PaymentPayload = z.infer<typeof paymentSchema>

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function buildPayment(value: PaymentPayload): ReceivablePayment {
  return new ReceivablePayment({
    id: value.id,
    entryId: value.entryId,
    amount: toNumber(value.amount),
    paidAt: value.paidAt,
    method: (value.method ?? null) as PaymentMethod | null,
    notes: value.notes,
    createdAt: value.createdAt,
  })
}

function build(value: ReceivablePayload): Receivable {
  return new Receivable({
    id: value.id,
    establishmentId: value.establishmentId,
    type: value.type as FinancialType,
    status: value.status as FinancialStatus,
    partnerId: value.partnerId,
    customerName: value.partner?.name ?? null,
    saleId: value.saleId,
    saleNumber: value.sale?.saleNumber ?? null,
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

export function toReceivable(data: unknown): Either<DomainError, Receivable> {
  const parsed = receivableSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('receivables', toIssueList(parsed.error)))
  }

  return Either.right(build(parsed.data))
}

/** `POST /receivables` devolve as parcelas geradas como um array cru. */
export function toReceivableArray(
  data: unknown,
): Either<DomainError, Receivable[]> {
  const parsed = z.array(receivableSchema).safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('receivables', toIssueList(parsed.error)))
  }

  return Either.right(parsed.data.map(build))
}

export function toReceivableList(
  data: unknown,
): Either<DomainError, ReceivableList> {
  const parsed = receivableListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(new ContractError('receivables', toIssueList(parsed.error)))
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}
