import type { IFiscalEventsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-events-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'

export class ListCorrectionLettersUseCase {
  private readonly repository: IFiscalEventsRepository

  constructor(repository: IFiscalEventsRepository) {
    this.repository = repository
  }

  async execute(
    fiscalDocumentId: string,
  ): Promise<Either<DomainError, FiscalCorrectionLetter[]>> {
    return this.repository.listCorrectionLetters(fiscalDocumentId)
  }
}
