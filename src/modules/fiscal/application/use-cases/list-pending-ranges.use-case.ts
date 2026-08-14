import type { IFiscalEventsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-events-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalPendingRange } from '@/modules/fiscal/domain/responses/fiscal-pending-range'

export class ListPendingRangesUseCase {
  private readonly repository: IFiscalEventsRepository

  constructor(repository: IFiscalEventsRepository) {
    this.repository = repository
  }

  async execute(
    establishmentId: string,
  ): Promise<Either<DomainError, FiscalPendingRange[]>> {
    return this.repository.listPendingRanges(establishmentId)
  }
}
