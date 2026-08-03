import type { ICashRegistersRepository } from '@/modules/cash/domain/interfaces/i-cash-registers-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashRegister } from '@/modules/cash/domain/entities/cash-register.entity'
import type { CreateCashRegisterDto } from '@/modules/cash/domain/dto/create-cash-register-dto'

export class CreateCashRegisterUseCase {
  private readonly repository: ICashRegistersRepository

  constructor(repository: ICashRegistersRepository) {
    this.repository = repository
  }

  async execute(
    dto: CreateCashRegisterDto,
  ): Promise<Either<DomainError, CashRegister>> {
    return this.repository.create(dto)
  }
}
