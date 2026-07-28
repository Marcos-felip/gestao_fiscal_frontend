import type { IProductsRepository } from '@/modules/products/domain/interfaces/i-products-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ProductList } from '@/modules/products/domain/responses/product-list-response'
import type { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'

export class ListProductsUseCase {
  private readonly repository: IProductsRepository

  constructor(repository: IProductsRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListProductsDto,
  ): Promise<Either<DomainError, ProductList>> {
    return this.repository.list(dto)
  }
}
