import type { IPayablesRepository } from '@/modules/payables/domain/interfaces/i-payables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { PayableList } from '@/modules/payables/domain/responses/payable-list-response'
import type { ListPayablesDto } from '@/modules/payables/domain/dto/list-payables-dto'

export class ListPayablesUseCase {
  private readonly repository: IPayablesRepository

  constructor(repository: IPayablesRepository) {
    this.repository = repository
  }

  async execute(dto: ListPayablesDto): Promise<Either<DomainError, PayableList>> {
    return this.repository.list(dto)
  }
}
