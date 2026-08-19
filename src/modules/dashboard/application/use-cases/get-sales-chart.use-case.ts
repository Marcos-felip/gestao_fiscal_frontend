import type { IDashboardRepository } from '@/modules/dashboard/domain/interfaces/i-dashboard-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardSalesChart } from '@/modules/dashboard/domain/responses/dashboard-sales-chart'
import type { GetSalesChartDto } from '@/modules/dashboard/domain/dto/get-sales-chart-dto'

export class GetSalesChartUseCase {
  private readonly repository: IDashboardRepository

  constructor(repository: IDashboardRepository) {
    this.repository = repository
  }

  async execute(
    dto: GetSalesChartDto,
  ): Promise<Either<DomainError, DashboardSalesChart>> {
    return this.repository.getSalesChart(dto)
  }
}
