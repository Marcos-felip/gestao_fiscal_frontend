import type { IDashboardRepository } from '@/modules/dashboard/domain/interfaces/i-dashboard-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardCash } from '@/modules/dashboard/domain/responses/dashboard-cash'

export class GetCashStatusUseCase {
  private readonly repository: IDashboardRepository

  constructor(repository: IDashboardRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, DashboardCash>> {
    return this.repository.getCash()
  }
}
