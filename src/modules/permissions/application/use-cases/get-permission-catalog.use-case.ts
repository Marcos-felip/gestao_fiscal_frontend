import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IPermissionsRepository } from '@/modules/permissions/domain/interfaces/i-permissions-repository.interface'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'

export class GetPermissionCatalogUseCase {
  private readonly repository: IPermissionsRepository

  constructor(repository: IPermissionsRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, PermissionGroup[]>> {
    return this.repository.getCatalog()
  }
}
