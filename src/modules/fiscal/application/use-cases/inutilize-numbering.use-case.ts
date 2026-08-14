import type { IFiscalEventsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-events-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalInutilization } from '@/modules/fiscal/domain/entities/fiscal-inutilization.entity'
import type { InutilizeNumberingDto } from '@/modules/fiscal/domain/dto/inutilize-numbering-dto'

export class InutilizeNumberingUseCase {
  private readonly repository: IFiscalEventsRepository

  constructor(repository: IFiscalEventsRepository) {
    this.repository = repository
  }

  async execute(
    dto: InutilizeNumberingDto,
  ): Promise<Either<DomainError, FiscalInutilization>> {
    return this.repository.inutilize(dto)
  }
}
