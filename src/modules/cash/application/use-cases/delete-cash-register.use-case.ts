import type { ICashRegistersRepository } from '@/modules/cash/domain/interfaces/i-cash-registers-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class DeleteCashRegisterUseCase {
  private readonly repository: ICashRegistersRepository

  constructor(repository: ICashRegistersRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, void>> {
    return this.repository.delete(id)
  }
}
