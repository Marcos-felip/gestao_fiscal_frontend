import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class DeleteSaleUseCase {
  private readonly repository: ISalesRepository

  constructor(repository: ISalesRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, void>> {
    return this.repository.remove(id)
  }
}
