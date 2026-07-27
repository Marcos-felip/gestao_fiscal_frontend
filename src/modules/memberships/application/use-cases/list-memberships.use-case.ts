import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'

export class ListMembershipsUseCase {
  private readonly repository: IMembershipsRepository

  constructor(repository: IMembershipsRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, Membership[]>> {
    return this.repository.list()
  }
}
