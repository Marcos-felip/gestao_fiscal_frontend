import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import type { StockMovementList } from '@/modules/stock/domain/responses/stock-movement-list-response'
import type { ListStockMovementsDto } from '@/modules/stock/domain/dto/list-stock-movements-dto'
import type { CreateStockMovementDto } from '@/modules/stock/domain/dto/create-stock-movement-dto'

export interface IStockRepository {
  listMovements(
    dto: ListStockMovementsDto,
  ): Promise<Either<DomainError, StockMovementList>>
  createMovement(
    dto: CreateStockMovementDto,
  ): Promise<Either<DomainError, StockMovement>>
}
