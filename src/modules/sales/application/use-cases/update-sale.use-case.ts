import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import type { UpdateSaleDto } from '@/modules/sales/domain/dto/update-sale-dto'

export class UpdateSaleUseCase {
  private readonly repository: ISalesRepository

  constructor(repository: ISalesRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: UpdateSaleDto,
  ): Promise<Either<DomainError, Sale>> {
    return this.repository.update(id, dto)
  }
}
