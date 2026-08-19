import type { IDashboardRepository } from '@/modules/dashboard/domain/interfaces/i-dashboard-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardSales } from '@/modules/dashboard/domain/responses/dashboard-sales'
import type { DashboardSalesChart } from '@/modules/dashboard/domain/responses/dashboard-sales-chart'
import type { DashboardFinancial } from '@/modules/dashboard/domain/responses/dashboard-financial'
import type { DashboardFiscal } from '@/modules/dashboard/domain/responses/dashboard-fiscal'
import type { DashboardStockAlerts } from '@/modules/dashboard/domain/responses/dashboard-stock-alerts'
import type { DashboardCash } from '@/modules/dashboard/domain/responses/dashboard-cash'
import type { GetSalesChartDto } from '@/modules/dashboard/domain/dto/get-sales-chart-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toDashboardCash,
  toDashboardFinancial,
  toDashboardFiscal,
  toDashboardSales,
  toDashboardSalesChart,
  toDashboardStockAlerts,
} from '@/modules/dashboard/data/mappers/dashboard.mapper'

const BASE = '/dashboard'

export class DashboardRepository implements IDashboardRepository {
  async getSales(): Promise<Either<DomainError, DashboardSales>> {
    const result = await httpClient.get<unknown>(`${BASE}/sales`)
    return result.flatMap(toDashboardSales)
  }

  async getSalesChart(
    dto: GetSalesChartDto,
  ): Promise<Either<DomainError, DashboardSalesChart>> {
    const result = await httpClient.get<unknown>(`${BASE}/sales-chart`, {
      params: { range: dto.range },
    })
    return result.flatMap(toDashboardSalesChart)
  }

  async getReceivables(): Promise<Either<DomainError, DashboardFinancial>> {
    const result = await httpClient.get<unknown>(`${BASE}/receivables`)
    return result.flatMap(toDashboardFinancial)
  }

  async getPayables(): Promise<Either<DomainError, DashboardFinancial>> {
    const result = await httpClient.get<unknown>(`${BASE}/payables`)
    return result.flatMap(toDashboardFinancial)
  }

  async getFiscal(): Promise<Either<DomainError, DashboardFiscal>> {
    const result = await httpClient.get<unknown>(`${BASE}/fiscal`)
    return result.flatMap(toDashboardFiscal)
  }

  async getStockAlerts(): Promise<Either<DomainError, DashboardStockAlerts>> {
    const result = await httpClient.get<unknown>(`${BASE}/stock-alerts`)
    return result.flatMap(toDashboardStockAlerts)
  }

  async getCash(): Promise<Either<DomainError, DashboardCash>> {
    const result = await httpClient.get<unknown>(`${BASE}/cash`)
    return result.flatMap(toDashboardCash)
  }
}
