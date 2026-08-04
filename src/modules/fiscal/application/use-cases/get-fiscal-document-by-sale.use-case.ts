import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'

export class GetFiscalDocumentBySaleUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    saleId: string,
  ): Promise<Either<DomainError, FiscalDocument | null>> {
    return this.repository.getBySale(saleId)
  }
}
