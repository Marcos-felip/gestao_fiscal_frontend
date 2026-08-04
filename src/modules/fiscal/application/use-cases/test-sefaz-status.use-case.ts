import type { IFiscalSettingsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-settings-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { StatusServicoResult } from '@/modules/fiscal/domain/responses/status-servico-result'

export class TestSefazStatus {
  private readonly repository: IFiscalSettingsRepository

  constructor(repository: IFiscalSettingsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
  ): Promise<Either<DomainError, StatusServicoResult>> {
    return this.repository.testSefaz(establishmentId)
  }
}
