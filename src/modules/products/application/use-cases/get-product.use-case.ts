import type { IProductsRepository } from '@/modules/products/domain/interfaces/i-products-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Product } from '@/modules/products/domain/entities/product.entity'

export class GetProductUseCase {
  private readonly repository: IProductsRepository

  constructor(repository: IProductsRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, Product>> {
    return this.repository.getById(id)
  }
}
