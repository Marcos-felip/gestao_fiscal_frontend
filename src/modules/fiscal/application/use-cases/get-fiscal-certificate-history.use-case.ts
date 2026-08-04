import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalCertificateEvent } from '@/modules/fiscal/domain/entities/fiscal-certificate-event.entity'

export class GetFiscalCertificateHistory {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalCertificateEvent[]>> {
    return this.repository.getCertificateHistory(establishmentId)
  }
}
