import type { IProductsRepository } from '@/modules/products/domain/interfaces/i-products-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ProductFiscalPendingList } from '@/modules/products/domain/responses/product-fiscal-pending'
import type { ListFiscalPendingDto } from '@/modules/products/domain/dto/list-fiscal-pending-dto'

export class ListFiscalPendingProductsUseCase {
  private readonly repository: IProductsRepository

  constructor(repository: IProductsRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListFiscalPendingDto,
  ): Promise<Either<DomainError, ProductFiscalPendingList>> {
    return this.repository.listFiscalPending(dto)
  }
}
