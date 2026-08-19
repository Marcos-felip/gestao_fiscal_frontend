import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalEngineHealth } from '@/modules/fiscal/domain/responses/fiscal-engine-health'

export class GetFiscalEngineHealth {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, FiscalEngineHealth>> {
    return this.repository.getEngineHealth()
  }
}
