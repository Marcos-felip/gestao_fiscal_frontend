import type { ICashSessionsRepository } from '@/modules/cash/domain/interfaces/i-cash-sessions-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashSessionList } from '@/modules/cash/domain/responses/cash-session-list-response'
import type { ListCashSessionsDto } from '@/modules/cash/domain/dto/list-cash-sessions-dto'

export class ListCashSessionsUseCase {
  private readonly repository: ICashSessionsRepository

  constructor(repository: ICashSessionsRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListCashSessionsDto,
  ): Promise<Either<DomainError, CashSessionList>> {
    return this.repository.list(dto)
  }
}
