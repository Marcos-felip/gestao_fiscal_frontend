import type { IReceivablesRepository } from '@/modules/receivables/domain/interfaces/i-receivables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import type { CreateReceivableDto } from '@/modules/receivables/domain/dto/create-receivable-dto'

export class CreateReceivableUseCase {
  private readonly repository: IReceivablesRepository

  constructor(repository: IReceivablesRepository) {
    this.repository = repository
  }

  async execute(
    dto: CreateReceivableDto,
  ): Promise<Either<DomainError, Receivable[]>> {
    return this.repository.create(dto)
  }
}
