import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalSettingsEvent } from '@/modules/fiscal/domain/entities/fiscal-settings-event.entity'

export class GetSettingsHistoryUseCase {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalSettingsEvent[]>> {
    return this.repository.getSettingsHistory(establishmentId)
  }
}
