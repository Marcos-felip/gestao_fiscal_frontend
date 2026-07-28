import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IPermissionProfilesRepository } from '@/modules/permissions/domain/interfaces/i-permission-profiles-repository.interface'
import type { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'

export class ListProfilesUseCase {
  private readonly repository: IPermissionProfilesRepository

  constructor(repository: IPermissionProfilesRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, PermissionProfile[]>> {
    return this.repository.list()
  }
}
