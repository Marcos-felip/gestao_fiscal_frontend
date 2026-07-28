import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'

export class UpdateMemberRoleUseCase {
  private readonly repository: IMembershipsRepository

  constructor(repository: IMembershipsRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: UpdateMemberRoleDto,
  ): Promise<Either<DomainError, Membership>> {
    return this.repository.updateRole(id, dto)
  }
}
