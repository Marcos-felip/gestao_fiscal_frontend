import type { IPayablesRepository } from '@/modules/payables/domain/interfaces/i-payables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'
import type { PayPayableDto } from '@/modules/payables/domain/dto/pay-payable-dto'

export class PayPayableUseCase {
  private readonly repository: IPayablesRepository

  constructor(repository: IPayablesRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: PayPayableDto,
  ): Promise<Either<DomainError, Payable>> {
    return this.repository.pay(id, dto)
  }
}
