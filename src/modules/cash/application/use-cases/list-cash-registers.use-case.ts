import type { ICashRegistersRepository } from '@/modules/cash/domain/interfaces/i-cash-registers-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import { ListCashRegistersDto } from '@/modules/cash/domain/dto/list-cash-registers-dto'

export class ListCashRegistersUseCase {
  private readonly repository: ICashRegistersRepository

  constructor(repository: ICashRegistersRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListCashRegistersDto = new ListCashRegistersDto(),
  ): Promise<Either<DomainError, CashRegister[]>> {
    return this.repository.list(dto)
  }
}
