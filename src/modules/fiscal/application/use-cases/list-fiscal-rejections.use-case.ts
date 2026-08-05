import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalRejectionListResponse } from '@/modules/fiscal/domain/responses/fiscal-rejection-item'
import type { QueryFiscalDocumentsDto } from '@/modules/fiscal/domain/dto/query-fiscal-documents-dto'

export class ListFiscalRejectionsUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    query: QueryFiscalDocumentsDto,
  ): Promise<Either<DomainError, FiscalRejectionListResponse>> {
    return this.repository.getRejections(query)
  }
}
