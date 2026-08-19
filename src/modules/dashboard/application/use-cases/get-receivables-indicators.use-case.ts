import type { IDashboardRepository } from '@/modules/dashboard/domain/interfaces/i-dashboard-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardFinancial } from '@/modules/dashboard/domain/responses/dashboard-financial'

export class GetReceivablesIndicatorsUseCase {
  private readonly repository: IDashboardRepository

  constructor(repository: IDashboardRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, DashboardFinancial>> {
    return this.repository.getReceivables()
  }
}
