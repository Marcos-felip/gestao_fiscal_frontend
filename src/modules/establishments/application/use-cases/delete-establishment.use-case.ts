import type { IEstablishmentRepository } from '@/modules/establishments/domain/interfaces/i-establishment-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class DeleteEstablishmentUseCase {
  private readonly repository: IEstablishmentRepository

  constructor(repository: IEstablishmentRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, void>> {
    return this.repository.delete(id)
  }
}
