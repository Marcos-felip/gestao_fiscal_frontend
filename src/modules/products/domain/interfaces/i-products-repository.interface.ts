import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import type { ProductList } from '@/modules/products/domain/responses/product-list-response'
import type { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import type { CreateProductDto } from '@/modules/products/domain/dto/create-product-dto'
import type { UpdateProductDto } from '@/modules/products/domain/dto/update-product-dto'

export interface IProductsRepository {
  list(dto: ListProductsDto): Promise<Either<DomainError, ProductList>>
  getById(id: string): Promise<Either<DomainError, Product>>
  create(dto: CreateProductDto): Promise<Either<DomainError, Product>>
  update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Either<DomainError, Product>>
  remove(id: string): Promise<Either<DomainError, void>>
}
