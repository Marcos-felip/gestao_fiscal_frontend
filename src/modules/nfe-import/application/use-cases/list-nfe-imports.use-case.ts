import type { INfeImportRepository } from '@/modules/nfe-import/domain/interfaces/i-nfe-import-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { NfeImportList } from '@/modules/nfe-import/domain/responses/nfe-import-list'
import type { ListNfeImportsDto } from '@/modules/nfe-import/domain/dto/list-nfe-imports-dto'

export class ListNfeImportsUseCase {
  private readonly repository: INfeImportRepository

  constructor(repository: INfeImportRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListNfeImportsDto,
  ): Promise<Either<DomainError, NfeImportList>> {
    return this.repository.list(dto)
  }
}
