import type { ICashSessionsRepository } from '@/modules/cash/domain/interfaces/i-cash-sessions-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'

export class GetCurrentCashSessionUseCase {
  private readonly repository: ICashSessionsRepository

  constructor(repository: ICashSessionsRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, CashSession | null>> {
    return this.repository.getCurrent()
  }
}
