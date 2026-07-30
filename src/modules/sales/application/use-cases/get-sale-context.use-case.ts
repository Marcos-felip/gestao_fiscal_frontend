import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { SaleContext } from '@/modules/sales/domain/responses/sale-context-response'

export class GetSaleContextUseCase {
  private readonly repository: ISalesRepository

  constructor(repository: ISalesRepository) {
    this.repository = repository
  }

  execute(): Promise<Either<DomainError, SaleContext>> {
    return this.repository.getContext()
  }
}
