import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalDocument } from '@/modules/fiscal/domain/entities/fiscal-document.entity'
import type { CancelFiscalDocumentDto } from '@/modules/fiscal/domain/dto/cancel-fiscal-document-dto'

export class CancelFiscalDocumentUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: CancelFiscalDocumentDto,
  ): Promise<Either<DomainError, FiscalDocument>> {
    return this.repository.cancel(id, dto.justificativa)
  }
}
