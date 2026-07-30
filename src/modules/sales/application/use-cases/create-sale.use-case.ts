import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import type { CreateSaleDto } from '@/modules/sales/domain/dto/create-sale-dto'

export class CreateSaleUseCase {
  private readonly repository: ISalesRepository

  constructor(repository: ISalesRepository) {
    this.repository = repository
  }

  async execute(dto: CreateSaleDto): Promise<Either<DomainError, Sale>> {
    return this.repository.create(dto)
  }
}
