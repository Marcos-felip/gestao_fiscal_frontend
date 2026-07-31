import type { IReceivablesRepository } from '@/modules/receivables/domain/interfaces/i-receivables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import type { PayReceivableDto } from '@/modules/receivables/domain/dto/pay-receivable-dto'

export class PayReceivableUseCase {
  private readonly repository: IReceivablesRepository

  constructor(repository: IReceivablesRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: PayReceivableDto,
  ): Promise<Either<DomainError, Receivable>> {
    return this.repository.pay(id, dto)
  }
}
