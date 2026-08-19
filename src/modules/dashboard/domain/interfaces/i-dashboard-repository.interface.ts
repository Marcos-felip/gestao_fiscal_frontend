import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardSales } from '@/modules/dashboard/domain/responses/dashboard-sales'
import type { DashboardSalesChart } from '@/modules/dashboard/domain/responses/dashboard-sales-chart'
import type { DashboardFinancial } from '@/modules/dashboard/domain/responses/dashboard-financial'
import type { DashboardFiscal } from '@/modules/dashboard/domain/responses/dashboard-fiscal'
import type { DashboardStockAlerts } from '@/modules/dashboard/domain/responses/dashboard-stock-alerts'
import type { DashboardCash } from '@/modules/dashboard/domain/responses/dashboard-cash'
import type { GetSalesChartDto } from '@/modules/dashboard/domain/dto/get-sales-chart-dto'

export interface IDashboardRepository {
  getSales(): Promise<Either<DomainError, DashboardSales>>
  getSalesChart(
    dto: GetSalesChartDto,
  ): Promise<Either<DomainError, DashboardSalesChart>>
  getReceivables(): Promise<Either<DomainError, DashboardFinancial>>
  getPayables(): Promise<Either<DomainError, DashboardFinancial>>
  getFiscal(): Promise<Either<DomainError, DashboardFiscal>>
  getStockAlerts(): Promise<Either<DomainError, DashboardStockAlerts>>
  getCash(): Promise<Either<DomainError, DashboardCash>>
}
