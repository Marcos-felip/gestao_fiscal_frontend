import type { IEstablishmentRepository } from '@/modules/establishments/domain/interfaces/i-establishment-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { CreateEstablishmentDto } from '@/modules/establishments/domain/dto/create-establishment-dto'

export class CreateEstablishmentUseCase {
  private readonly repository: IEstablishmentRepository

  constructor(repository: IEstablishmentRepository) {
    this.repository = repository
  }

  async execute(
    dto: CreateEstablishmentDto,
  ): Promise<Either<DomainError, Establishment>> {
    return this.repository.create(dto)
  }
}
