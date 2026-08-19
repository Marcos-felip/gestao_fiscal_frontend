import type { IDashboardRepository } from '@/modules/dashboard/domain/interfaces/i-dashboard-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { DashboardFiscal } from '@/modules/dashboard/domain/responses/dashboard-fiscal'

export class GetFiscalIndicatorsUseCase {
  private readonly repository: IDashboardRepository

  constructor(repository: IDashboardRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, DashboardFiscal>> {
    return this.repository.getFiscal()
  }
}
