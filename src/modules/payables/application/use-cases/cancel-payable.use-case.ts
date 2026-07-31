import type { IPayablesRepository } from '@/modules/payables/domain/interfaces/i-payables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'

export class CancelPayableUseCase {
  private readonly repository: IPayablesRepository

  constructor(repository: IPayablesRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, Payable>> {
    return this.repository.cancel(id)
  }
}
