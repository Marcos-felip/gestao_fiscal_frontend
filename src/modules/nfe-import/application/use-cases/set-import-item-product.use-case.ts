import type { INfeImportRepository } from '@/modules/nfe-import/domain/interfaces/i-nfe-import-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { NfeImport } from '@/modules/nfe-import/domain/entities/nfe-import.entity'

/**
 * Aponta o produto de um item. O backend memoriza a escolha por fornecedor —
 * é o que faz a próxima nota do mesmo fornecedor não perguntar de novo.
 */
export class SetImportItemProductUseCase {
  private readonly repository: INfeImportRepository

  constructor(repository: INfeImportRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    itemId: string,
    productId: string,
  ): Promise<Either<DomainError, NfeImport>> {
    return this.repository.setItemProduct(id, itemId, productId)
  }
}
