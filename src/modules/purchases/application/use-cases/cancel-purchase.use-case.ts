import type { IPurchasesRepository } from '@/modules/purchases/domain/interfaces/i-purchases-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'

export class CancelPurchaseUseCase {
  private readonly repository: IPurchasesRepository

  constructor(repository: IPurchasesRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, Purchase>> {
    return this.repository.cancel(id)
  }
}
