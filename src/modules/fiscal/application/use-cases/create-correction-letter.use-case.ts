import type { IFiscalEventsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-events-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalCorrectionLetter } from '@/modules/fiscal/domain/entities/fiscal-correction-letter.entity'
import type { CreateCorrectionLetterDto } from '@/modules/fiscal/domain/dto/create-correction-letter-dto'

export class CreateCorrectionLetterUseCase {
  private readonly repository: IFiscalEventsRepository

  constructor(repository: IFiscalEventsRepository) {
    this.repository = repository
  }

  async execute(
    fiscalDocumentId: string,
    dto: CreateCorrectionLetterDto,
  ): Promise<Either<DomainError, FiscalCorrectionLetter>> {
    return this.repository.createCorrectionLetter(fiscalDocumentId, dto)
  }
}
