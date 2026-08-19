import type { IDashboardRepository } from '@/modules/dashboard/domain/interfaces/i-dashboard-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardSales } from '@/modules/dashboard/domain/responses/dashboard-sales'

export class GetSalesIndicatorsUseCase {
  private readonly repository: IDashboardRepository

  constructor(repository: IDashboardRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, DashboardSales>> {
    return this.repository.getSales()
  }
}
