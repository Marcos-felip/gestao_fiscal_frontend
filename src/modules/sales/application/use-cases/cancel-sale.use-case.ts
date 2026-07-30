import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'

export class CancelSaleUseCase {
  private readonly repository: ISalesRepository

  constructor(repository: ISalesRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, Sale>> {
    return this.repository.cancel(id)
  }
}
