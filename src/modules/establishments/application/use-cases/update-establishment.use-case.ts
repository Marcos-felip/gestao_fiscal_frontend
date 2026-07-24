import type { IEstablishmentRepository } from '@/modules/establishments/domain/interfaces/i-establishment-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { UpdateEstablishmentDto } from '@/modules/establishments/domain/dto/update-establishment-dto'

export class UpdateEstablishmentUseCase {
  private readonly repository: IEstablishmentRepository

  constructor(repository: IEstablishmentRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: UpdateEstablishmentDto,
  ): Promise<Either<DomainError, Establishment>> {
    return this.repository.update(id, dto)
  }
}
