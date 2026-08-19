import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalConsultaResult } from '@/modules/fiscal/domain/responses/fiscal-consulta-result'

export class ConsultFiscalDocumentUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
  ): Promise<Either<DomainError, FiscalConsultaResult>> {
    return this.repository.consulta(id)
  }
}
