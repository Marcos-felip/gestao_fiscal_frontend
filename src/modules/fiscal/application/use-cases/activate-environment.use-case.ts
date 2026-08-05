import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalSettings } from '@/modules/fiscal/domain/entities/fiscal-settings.entity'
import type { FiscalEnvironment } from '@/enums/fiscal-environment.enum'

export class ActivateEnvironmentUseCase {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
    ambiente: FiscalEnvironment,
  ): Promise<Either<DomainError, FiscalSettings>> {
    return this.repository.activateEnvironment(establishmentId, ambiente)
  }
}
