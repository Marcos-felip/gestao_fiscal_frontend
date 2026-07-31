import type { IReceivablesRepository } from '@/modules/receivables/domain/interfaces/i-receivables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { ReceivableList } from '@/modules/receivables/domain/responses/receivable-list-response'
import type { ListReceivablesDto } from '@/modules/receivables/domain/dto/list-receivables-dto'

export class ListReceivablesUseCase {
  private readonly repository: IReceivablesRepository

  constructor(repository: IReceivablesRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListReceivablesDto,
  ): Promise<Either<DomainError, ReceivableList>> {
    return this.repository.list(dto)
  }
}
