import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { FiscalXmlType } from '@/modules/fiscal/domain/entities/fiscal-document.entity'

export class DownloadFiscalXmlUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    tipo: FiscalXmlType,
  ): Promise<Either<DomainError, string>> {
    return this.repository.getXml(id, tipo)
  }
}
