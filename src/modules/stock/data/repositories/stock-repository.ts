import type { IStockRepository } from '@/modules/stock/domain/interfaces/i-stock-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import type { StockMovementList } from '@/modules/stock/domain/responses/stock-movement-list-response'
import type { ListStockMovementsDto } from '@/modules/stock/domain/dto/list-stock-movements-dto'
import type { CreateStockMovementDto } from '@/modules/stock/domain/dto/create-stock-movement-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toStockMovement,
  toStockMovementList,
} from '@/modules/stock/data/mappers/stock-movement.mapper'

export class StockRepository implements IStockRepository {
  async listMovements(
    dto: ListStockMovementsDto,
  ): Promise<Either<DomainError, StockMovementList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.productId) params.productId = dto.productId
    if (dto.type) params.type = dto.type
    if (dto.startDate) params.startDate = dto.startDate
    if (dto.endDate) params.endDate = dto.endDate

    const result = await httpClient.get<unknown>('/stock/movements', { params })
    return result.flatMap(toStockMovementList)
  }

  async createMovement(
    dto: CreateStockMovementDto,
  ): Promise<Either<DomainError, StockMovement>> {
    const payload: Record<string, unknown> = {
      productId: dto.productId,
      type: dto.type,
      quantity: dto.quantity,
    }
    if (dto.reason) payload.reason = dto.reason

    const result = await httpClient.post<unknown>('/stock/movements', payload)
    return result.flatMap(toStockMovement)
  }
}
