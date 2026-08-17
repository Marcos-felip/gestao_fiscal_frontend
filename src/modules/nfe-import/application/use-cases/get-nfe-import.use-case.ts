import type { INfeImportRepository } from '@/modules/nfe-import/domain/interfaces/i-nfe-import-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'

export class GetNfeImportUseCase {
  private readonly repository: INfeImportRepository

  constructor(repository: INfeImportRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, NfeImport>> {
    return this.repository.getById(id)
  }
}
