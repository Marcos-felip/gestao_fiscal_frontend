import type { IStockRepository } from '@/modules/stock/domain/interfaces/i-stock-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { StockMovement } from '@/modules/stock/domain/entities/stock-movement.entity'
import type { CreateStockMovementDto } from '@/modules/stock/domain/dto/create-stock-movement-dto'

export class CreateStockMovementUseCase {
  private readonly repository: IStockRepository

  constructor(repository: IStockRepository) {
    this.repository = repository
  }

  async execute(
    dto: CreateStockMovementDto,
  ): Promise<Either<DomainError, StockMovement>> {
    return this.repository.createMovement(dto)
  }
}
