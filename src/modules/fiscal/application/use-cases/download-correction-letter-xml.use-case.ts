import type { IFiscalEventsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-events-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class DownloadCorrectionLetterXmlUseCase {
  private readonly repository: IFiscalEventsRepository

  constructor(repository: IFiscalEventsRepository) {
    this.repository = repository
  }

  async execute(
    fiscalDocumentId: string,
    sequencia: number,
  ): Promise<Either<DomainError, string>> {
    return this.repository.getCorrectionLetterXml(fiscalDocumentId, sequencia)
  }
}
