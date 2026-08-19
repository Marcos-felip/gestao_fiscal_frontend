import type { IProductsRepository } from '@/modules/products/domain/interfaces/i-products-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Product } from '@/modules/products/domain/entities/product.entity'
import type { ProductList } from '@/modules/products/domain/responses/product-list-response'
import type { ProductFiscalPendingList } from '@/modules/products/domain/responses/product-fiscal-pending'
import type { ListProductsDto } from '@/modules/products/domain/dto/list-products-dto'
import type { ListFiscalPendingDto } from '@/modules/products/domain/dto/list-fiscal-pending-dto'
import type { CreateProductDto } from '@/modules/products/domain/dto/create-product-dto'
import type { UpdateProductDto } from '@/modules/products/domain/dto/update-product-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toProduct,
  toProductList,
} from '@/modules/products/data/mappers/product.mapper'
import { toProductFiscalPendingList } from '@/modules/products/data/mappers/product-fiscal-pending.mapper'

export class ProductsRepository implements IProductsRepository {
  async list(dto: ListProductsDto): Promise<Either<DomainError, ProductList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.search) params.search = dto.search

    const result = await httpClient.get<unknown>('/products', { params })
    return result.flatMap(toProductList)
  }

  /**
   * Só os produtos que bloqueariam a emissão, com o motivo de cada um.
   *
   * É filtro do servidor, não da página carregada: peneirar no cliente só
   * enxergaria os 20 produtos da página atual e diria "nenhuma pendência"
   * quando elas estivessem na página 3.
   */
  async listFiscalPending(
    dto: ListFiscalPendingDto,
  ): Promise<Either<DomainError, ProductFiscalPendingList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.search) params.search = dto.search

    const result = await httpClient.get<unknown>('/products/fiscal-pending', {
      params,
    })
    return result.flatMap(toProductFiscalPendingList)
  }

  async getById(id: string): Promise<Either<DomainError, Product>> {
    const result = await httpClient.get<unknown>(`/products/${id}`)
    return result.flatMap(toProduct)
  }

  async create(dto: CreateProductDto): Promise<Either<DomainError, Product>> {
    const result = await httpClient.post<unknown>(
      '/products',
      this.toPayload(dto),
    )
    return result.flatMap(toProduct)
  }

  async update(
    id: string,
    dto: UpdateProductDto,
  ): Promise<Either<DomainError, Product>> {
    const result = await httpClient.patch<unknown>(
      `/products/${id}`,
      this.toPayload(dto),
    )
    return result.flatMap(toProduct)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/products/${id}`)
  }

  /** Envia apenas os campos definidos (POST/PATCH parcial). */
  private toPayload(dto: object): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) payload[key] = value
    }
    return payload
  }
}
