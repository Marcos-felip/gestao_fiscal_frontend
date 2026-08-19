import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ProductionChecklist } from '@/modules/fiscal/domain/responses/production-checklist'

export class GetProductionChecklistUseCase {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
  ): Promise<Either<DomainError, ProductionChecklist>> {
    return this.repository.getProductionChecklist(establishmentId)
  }
}
