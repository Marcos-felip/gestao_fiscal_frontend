import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'

export class RemoveMemberUseCase {
  private readonly repository: IMembershipsRepository

  constructor(repository: IMembershipsRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, void>> {
    return this.repository.remove(id)
  }
}
