import type { IReceivablesRepository } from '@/modules/receivables/domain/interfaces/i-receivables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'

export class GetReceivableUseCase {
  private readonly repository: IReceivablesRepository

  constructor(repository: IReceivablesRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, Receivable>> {
    return this.repository.getById(id)
  }
}
