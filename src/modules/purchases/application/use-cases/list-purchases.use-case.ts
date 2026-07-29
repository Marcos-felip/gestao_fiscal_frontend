import type { IPurchasesRepository } from '@/modules/purchases/domain/interfaces/i-purchases-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { PurchaseList } from '@/modules/purchases/domain/responses/purchase-list-response'
import type { ListPurchasesDto } from '@/modules/purchases/domain/dto/list-purchases-dto'

export class ListPurchasesUseCase {
  private readonly repository: IPurchasesRepository

  constructor(repository: IPurchasesRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListPurchasesDto,
  ): Promise<Either<DomainError, PurchaseList>> {
    return this.repository.list(dto)
  }
}
