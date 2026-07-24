import type { IEstablishmentRepository } from '@/modules/establishments/domain/interfaces/i-establishment-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'

export class GetEstablishmentUseCase {
  private readonly repository: IEstablishmentRepository

  constructor(repository: IEstablishmentRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, Establishment>> {
    return this.repository.getById(id)
  }
}
