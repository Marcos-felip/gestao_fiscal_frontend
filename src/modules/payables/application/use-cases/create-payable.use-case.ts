import type { IPayablesRepository } from '@/modules/payables/domain/interfaces/i-payables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'
import type { CreatePayableDto } from '@/modules/payables/domain/dto/create-payable-dto'

export class CreatePayableUseCase {
  private readonly repository: IPayablesRepository

  constructor(repository: IPayablesRepository) {
    this.repository = repository
  }

  async execute(dto: CreatePayableDto): Promise<Either<DomainError, Payable[]>> {
    return this.repository.create(dto)
  }
}
