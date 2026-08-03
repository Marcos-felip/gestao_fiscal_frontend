import type { ICashSessionsRepository } from '@/modules/cash/domain/interfaces/i-cash-sessions-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashMovement } from '@/modules/cash/domain/entities/cash-movement.entity'
import type { CreateCashMovementDto } from '@/modules/cash/domain/dto/create-cash-movement-dto'

export class AddCashMovementUseCase {
  private readonly repository: ICashSessionsRepository

  constructor(repository: ICashSessionsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: CreateCashMovementDto,
  ): Promise<Either<DomainError, CashMovement>> {
    return this.repository.addMovement(id, dto)
  }
}
