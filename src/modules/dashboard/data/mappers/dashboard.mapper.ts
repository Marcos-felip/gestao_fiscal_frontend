import { z } from 'zod'
import { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { ContractError } from '@/core/errors/contract-error'
import { toIssueList } from '@/core/utils/zod-errors'
// Import de valor, nao `import type`: `z.nativeEnum` precisa do objeto em
// runtime, e `import type` some na compilacao.
import { SalesChartRange } from '@/core/enums/sales-chart-range.enum'
import type { DashboardSales } from '@/modules/dashboard/domain/responses/dashboard-sales'
import type { DashboardSalesChart } from '@/modules/dashboard/domain/responses/dashboard-sales-chart'
import type { DashboardFinancial } from '@/modules/dashboard/domain/responses/dashboard-financial'
import type { DashboardFiscal } from '@/modules/dashboard/domain/responses/dashboard-fiscal'
import type { DashboardStockAlerts } from '@/modules/dashboard/domain/responses/dashboard-stock-alerts'
import type { DashboardCash } from '@/modules/dashboard/domain/responses/dashboard-cash'

/** Decimais trafegam como string no JSON — o backend usa `Decimal`. */
const decimal = z.union([z.number(), z.string()])

function toNumber(value: number | string): number {
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const periodSchema = z.object({
  count: z.number(),
  total: decimal,
  averageTicket: decimal,
})

const salesSchema = z.object({
  today: periodSchema,
  yesterday: periodSchema,
  month: periodSchema,
  previousMonth: periodSchema,
  openQuotes: z.object({ count: z.number(), total: decimal }),
})

const chartSchema = z.object({
  range: z.nativeEnum(SalesChartRange),
  points: z.array(
    z.object({ key: z.string(), total: decimal, count: z.number() }),
  ),
})

const bucketSchema = z.object({ count: z.number(), total: decimal })

const financialSchema = z.object({
  overdue: bucketSchema,
  dueToday: bucketSchema,
  dueNext7Days: bucketSchema,
  open: bucketSchema,
  settledThisMonth: decimal,
})

const fiscalSchema = z.object({
  month: z.object({
    total: z.number(),
    authorized: z.number(),
    rejected: z.number(),
    cancelled: z.number(),
    pending: z.number(),
    contingency: z.number(),
    failed: z.number(),
  }),
  authorizedTotal: decimal,
  certificateAlerts: z
    .array(
      z.object({
        establishmentId: z.string(),
        establishmentName: z.string(),
        expiresAt: z.string(),
        daysToExpire: z.number(),
        expired: z.boolean(),
      }),
    )
    .default([]),
})

const stockAlertsSchema = z.object({
  outOfStock: z.number(),
  belowMinimum: z.number(),
  items: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        sku: z.string().nullable().default(null),
        unit: z.string(),
        currentStock: decimal,
        minStock: decimal.nullable().default(null),
      }),
    )
    .default([]),
})

const cashSchema = z.object({
  blindClose: z.boolean(),
  closedToday: z.number(),
  openSessions: z
    .array(
      z.object({
        id: z.string(),
        cashRegisterId: z.string(),
        cashRegisterName: z.string(),
        operatorId: z.string(),
        operatorName: z.string(),
        openedAt: z.string(),
        openingAmount: decimal,
        salesTotal: decimal.nullable().default(null),
      }),
    )
    .default([]),
})

/** Um `safeParse` que devolve `ContractError` — falha de schema é bug nosso. */
function parseWith<S extends z.ZodTypeAny, T>(
  schema: S,
  contract: string,
  build: (value: z.infer<S>) => T,
): (data: unknown) => Either<DomainError, T> {
  return (data: unknown) => {
    const parsed = schema.safeParse(data)

    if (!parsed.success) {
      return Either.left(new ContractError(contract, toIssueList(parsed.error)))
    }

    return Either.right(build(parsed.data))
  }
}

const toPeriod = (value: z.infer<typeof periodSchema>) => ({
  count: value.count,
  total: toNumber(value.total),
  averageTicket: toNumber(value.averageTicket),
})

const toBucket = (value: z.infer<typeof bucketSchema>) => ({
  count: value.count,
  total: toNumber(value.total),
})

export const toDashboardSales = parseWith(
  salesSchema,
  'dashboard-sales',
  (value): DashboardSales => ({
    today: toPeriod(value.today),
    yesterday: toPeriod(value.yesterday),
    month: toPeriod(value.month),
    previousMonth: toPeriod(value.previousMonth),
    openQuotes: {
      count: value.openQuotes.count,
      total: toNumber(value.openQuotes.total),
    },
  }),
)

export const toDashboardSalesChart = parseWith(
  chartSchema,
  'dashboard-sales-chart',
  (value): DashboardSalesChart => ({
    range: value.range,
    points: value.points.map((point) => ({
      key: point.key,
      total: toNumber(point.total),
      count: point.count,
    })),
  }),
)

export const toDashboardFinancial = parseWith(
  financialSchema,
  'dashboard-financial',
  (value): DashboardFinancial => ({
    overdue: toBucket(value.overdue),
    dueToday: toBucket(value.dueToday),
    dueNext7Days: toBucket(value.dueNext7Days),
    open: toBucket(value.open),
    settledThisMonth: toNumber(value.settledThisMonth),
  }),
)

export const toDashboardFiscal = parseWith(
  fiscalSchema,
  'dashboard-fiscal',
  (value): DashboardFiscal => ({
    month: value.month,
    authorizedTotal: toNumber(value.authorizedTotal),
    certificateAlerts: value.certificateAlerts,
  }),
)

export const toDashboardStockAlerts = parseWith(
  stockAlertsSchema,
  'dashboard-stock-alerts',
  (value): DashboardStockAlerts => ({
    outOfStock: value.outOfStock,
    belowMinimum: value.belowMinimum,
    items: value.items.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      unit: item.unit,
      currentStock: toNumber(item.currentStock),
      minStock: item.minStock === null ? null : toNumber(item.minStock),
    })),
  }),
)

export const toDashboardCash = parseWith(
  cashSchema,
  'dashboard-cash',
  (value): DashboardCash => ({
    blindClose: value.blindClose,
    closedToday: value.closedToday,
    openSessions: value.openSessions.map((session) => ({
      id: session.id,
      cashRegisterId: session.cashRegisterId,
      cashRegisterName: session.cashRegisterName,
      operatorId: session.operatorId,
      operatorName: session.operatorName,
      openedAt: session.openedAt,
      openingAmount: toNumber(session.openingAmount),
      // Nulo é preservado, nunca coagido para zero: é o valor que o fechamento
      // às cegas esconde, e a tela precisa dizer "oculto" em vez de "R$ 0,00".
      salesTotal:
        session.salesTotal === null ? null : toNumber(session.salesTotal),
    })),
  }),
)
