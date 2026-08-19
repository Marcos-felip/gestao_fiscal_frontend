import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import { CashMovement } from '@/modules/cash/domain/entities/cash-movement.entity'
import type { CashSessionSummary } from '@/modules/cash/domain/value-objects/cash-session-summary'
import type { CashSessionList } from '@/modules/cash/domain/responses/cash-session-list-response'
import type { CashSessionStatus } from '@/core/enums/cash-session-status.enum'
import type { CashMovementType } from '@/core/enums/cash-movement-type.enum'
import type { PaymentMethod } from '@/core/enums/payment-method.enum'
import { toIssueList } from '@/core/utils/zod-errors'

// Decimais do topo da sessão chegam como STRING (Prisma.Decimal.toJSON);
// os campos do `summary` já vêm como number calculado.
const decimal = z.union([z.number(), z.string()])
const nullableDecimal = z
  .union([z.number(), z.string()])
  .nullable()
  .default(null)

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function toNumberOrNull(value: number | string | null): number | null {
  if (value === null) return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const refSchema = z
  .object({ id: z.string(), name: z.string().nullable().default(null) })
  .nullable()
  .default(null)

const movementSchema = z.object({
  id: z.string(),
  sessionId: z.string().nullable().default(null),
  type: z.string(),
  amount: decimal.default(0),
  reason: z.string().nullable().default(null),
  createdById: z.string().nullable().default(null),
  createdBy: refSchema,
  createdAt: z.string().nullable().default(null),
})

const breakdownItemSchema = z.object({
  method: z.string(),
  amount: z.number().default(0),
})

const summarySchema = z
  .object({
    openingAmount: z.number().default(0),
    cashSales: z.number().nullable().default(null),
    supplies: z.number().default(0),
    withdrawals: z.number().default(0),
    expectedCash: z.number().nullable().default(null),
    countedCash: z.number().nullable().default(null),
    difference: z.number().nullable().default(null),
    salesCount: z.number().default(0),
    salesTotal: z.number().nullable().default(null),
    paymentBreakdown: z.array(breakdownItemSchema).nullable().default(null),
    creditTotal: z.number().nullable().default(null),
    blind: z.boolean().default(false),
  })
  .nullable()
  .default(null)

const cashSessionSchema = z.object({
  id: z.string(),
  establishmentId: z.string().nullable().default(null),
  cashRegisterId: z.string().nullable().default(null),
  cashRegister: refSchema,
  operatorId: z.string().nullable().default(null),
  operator: refSchema,
  status: z.string(),
  openingAmount: decimal.default(0),
  openedAt: z.string().nullable().default(null),
  closedAt: z.string().nullable().default(null),
  expectedCash: nullableDecimal,
  countedCash: nullableDecimal,
  difference: nullableDecimal,
  closingNotes: z.string().nullable().default(null),
  createdAt: z.string().nullable().default(null),
  updatedAt: z.string().nullable().default(null),
  movements: z.array(movementSchema).default([]),
  summary: summarySchema,
})

const cashSessionListSchema = z.object({
  data: z.array(cashSessionSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
})

type CashSessionPayload = z.infer<typeof cashSessionSchema>
type MovementPayload = z.infer<typeof movementSchema>
type SummaryPayload = NonNullable<z.infer<typeof summarySchema>>

function buildMovement(value: MovementPayload): CashMovement {
  return new CashMovement({
    id: value.id,
    sessionId: value.sessionId,
    type: value.type as CashMovementType,
    amount: toNumber(value.amount),
    reason: value.reason,
    createdById: value.createdById,
    createdByName: value.createdBy?.name ?? null,
    createdAt: value.createdAt,
  })
}

function buildSummary(value: SummaryPayload): CashSessionSummary {
  return {
    openingAmount: value.openingAmount,
    cashSales: value.cashSales,
    supplies: value.supplies,
    withdrawals: value.withdrawals,
    expectedCash: value.expectedCash,
    countedCash: value.countedCash,
    difference: value.difference,
    salesCount: value.salesCount,
    salesTotal: value.salesTotal,
    paymentBreakdown:
      value.paymentBreakdown?.map((item) => ({
        method: item.method as PaymentMethod,
        amount: item.amount,
      })) ?? null,
    creditTotal: value.creditTotal,
    blind: value.blind,
  }
}

function build(value: CashSessionPayload): CashSession {
  return new CashSession({
    id: value.id,
    establishmentId: value.establishmentId,
    cashRegisterId: value.cashRegisterId,
    cashRegisterName: value.cashRegister?.name ?? null,
    operatorId: value.operatorId,
    operatorName: value.operator?.name ?? null,
    status: value.status as CashSessionStatus,
    openingAmount: toNumber(value.openingAmount),
    openedAt: value.openedAt,
    closedAt: value.closedAt,
    expectedCash: toNumberOrNull(value.expectedCash),
    countedCash: toNumberOrNull(value.countedCash),
    difference: toNumberOrNull(value.difference),
    closingNotes: value.closingNotes,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    movements: value.movements.map(buildMovement),
    summary: value.summary ? buildSummary(value.summary) : null,
  })
}

export function toCashSession(data: unknown): Either<DomainError, CashSession> {
  const parsed = cashSessionSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('cash-sessions', toIssueList(parsed.error)),
    )
  }

  return Either.right(build(parsed.data))
}

/** `GET /cash-sessions/current` devolve a sessão aberta ou `null`. */
export function toCashSessionOrNull(
  data: unknown,
): Either<DomainError, CashSession | null> {
  if (data === null || data === undefined || data === '') {
    return Either.right(null)
  }
  return toCashSession(data)
}

export function toCashSessionList(
  data: unknown,
): Either<DomainError, CashSessionList> {
  const parsed = cashSessionListSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('cash-sessions', toIssueList(parsed.error)),
    )
  }

  const value = parsed.data
  return Either.right({
    items: value.data.map(build),
    total: value.total,
    page: value.page,
    limit: value.limit,
  })
}

export function toCashMovement(
  data: unknown,
): Either<DomainError, CashMovement> {
  const parsed = movementSchema.safeParse(data)

  if (!parsed.success) {
    return Either.left(
      new ContractError('cash-movements', toIssueList(parsed.error)),
    )
  }

  return Either.right(buildMovement(parsed.data))
}
