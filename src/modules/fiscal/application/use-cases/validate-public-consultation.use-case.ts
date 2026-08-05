import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ConsultaPublicaResult } from '@/modules/fiscal/domain/responses/production-checklist'

export class ValidatePublicConsultationUseCase {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
  ): Promise<Either<DomainError, ConsultaPublicaResult>> {
    return this.repository.validatePublicConsultation(establishmentId)
  }
}
