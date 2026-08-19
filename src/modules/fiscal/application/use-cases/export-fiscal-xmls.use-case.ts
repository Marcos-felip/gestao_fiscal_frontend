import type { IFiscalDocumentsRepository } from '@/modules/fiscal/domain/interfaces/i-fiscal-documents-repository.interface'
import type { ExportFiscalXmlsDto } from '@/modules/fiscal/domain/dto/export-fiscal-xmls-dto'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class ExportFiscalXmlsUseCase {
  private readonly repository: IFiscalDocumentsRepository

  constructor(repository: IFiscalDocumentsRepository) {
    this.repository = repository
  }

  async execute(dto: ExportFiscalXmlsDto): Promise<Either<DomainError, Blob>> {
    return this.repository.exportXmls(dto)
  }
}
