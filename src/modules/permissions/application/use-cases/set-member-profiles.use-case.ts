import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IPermissionProfilesRepository } from '@/modules/permissions/domain/interfaces/i-permission-profiles-repository.interface'
import type { ProfileRef } from '@/modules/permissions/domain/entities/permission-profile.entity'

export class SetMemberProfilesUseCase {
  private readonly repository: IPermissionProfilesRepository

  constructor(repository: IPermissionProfilesRepository) {
    this.repository = repository
  }

  async execute(
    membershipId: string,
    profileIds: string[],
  ): Promise<Either<DomainError, ProfileRef[]>> {
    return this.repository.setMemberProfiles(membershipId, profileIds)
  }
}
