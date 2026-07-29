import type { IStockRepository } from '@/modules/stock/domain/interfaces/i-stock-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { StockMovementList } from '@/modules/stock/domain/responses/stock-movement-list-response'
import type { ListStockMovementsDto } from '@/modules/stock/domain/dto/list-stock-movements-dto'

export class ListStockMovementsUseCase {
  private readonly repository: IStockRepository

  constructor(repository: IStockRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListStockMovementsDto,
  ): Promise<Either<DomainError, StockMovementList>> {
    return this.repository.listMovements(dto)
  }
}
