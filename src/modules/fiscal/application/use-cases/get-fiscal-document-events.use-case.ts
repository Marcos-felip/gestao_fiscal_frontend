import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalDocumentEvent } from '@/modules/fiscal/domain/entities/fiscal-document-event.entity'

export class GetFiscalDocumentEventsUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
  ): Promise<Either<DomainError, FiscalDocumentEvent[]>> {
    return this.repository.getEvents(id)
  }
}
