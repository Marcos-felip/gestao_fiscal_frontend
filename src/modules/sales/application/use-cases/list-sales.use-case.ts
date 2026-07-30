import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { SaleList } from '@/modules/sales/domain/responses/sale-list-response'
import type { ListSalesDto } from '@/modules/sales/domain/dto/list-sales-dto'

export class ListSalesUseCase {
  private readonly repository: ISalesRepository

  constructor(repository: ISalesRepository) {
    this.repository = repository
  }

  async execute(dto: ListSalesDto): Promise<Either<DomainError, SaleList>> {
    return this.repository.list(dto)
  }
}
