import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalStatusHistory } from '@/modules/fiscal/domain/entities/fiscal-status-history.entity'

export class GetFiscalDocumentHistoryUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
  ): Promise<Either<DomainError, FiscalStatusHistory[]>> {
    return this.repository.getHistory(id)
  }
}
