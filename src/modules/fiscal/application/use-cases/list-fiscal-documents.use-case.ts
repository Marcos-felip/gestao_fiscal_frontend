import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalDocumentListResponse } from '@/modules/fiscal/domain/responses/fiscal-document-list-response'
import type { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'

export class ListFiscalDocumentsUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    query: QueryFiscalDocumentsDto,
  ): Promise<Either<DomainError, FiscalDocumentListResponse>> {
    return this.repository.list(query)
  }
}
