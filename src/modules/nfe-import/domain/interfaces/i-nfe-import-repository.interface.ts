import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'
import type { NfeImportList } from '@/modules/nfe-import/domain/responses/nfe-import-list'
import type { ListNfeImportsDto } from '@/modules/nfe-import/domain/dto/list-nfe-imports-dto'

export interface INfeImportRepository {
  importXml(file: File): Promise<Either<DomainError, NfeImport>>
  list(dto: ListNfeImportsDto): Promise<Either<DomainError, NfeImportList>>
  getById(id: string): Promise<Either<DomainError, NfeImport>>
  setItemProduct(
    id: string,
    itemId: string,
    productId: string,
  ): Promise<Either<DomainError, NfeImport>>
  confirm(id: string): Promise<Either<DomainError, NfeImport>>
}
