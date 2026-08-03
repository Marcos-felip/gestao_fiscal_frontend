import type { ICashSessionsRepository } from '@/modules/cash/domain/interfaces/i-cash-sessions-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import type { OpenCashSessionDto } from '@/modules/cash/domain/dto/open-cash-session-dto'

export class OpenCashSessionUseCase {
  private readonly repository: ICashSessionsRepository

  constructor(repository: ICashSessionsRepository) {
    this.repository = repository
  }

  async execute(
    dto: OpenCashSessionDto,
  ): Promise<Either<DomainError, CashSession>> {
    return this.repository.open(dto)
  }
}
