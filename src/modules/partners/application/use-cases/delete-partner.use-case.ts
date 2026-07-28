import type { IPartnersRepository } from '@/modules/partners/domain/interfaces/i-partners-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'

export class DeletePartnerUseCase {
  private readonly repository: IPartnersRepository

  constructor(repository: IPartnersRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, void>> {
    return this.repository.remove(id)
  }
}
