import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { httpClient } from '@/core/client/http-client'
import type { IPermissionsRepository } from '@/modules/permissions/domain/interfaces/i-permissions-repository.interface'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'
import {
  toPermissionCodes,
  toPermissionGroups,
} from '@/modules/permissions/data/mappers/permission.mapper'

export class PermissionRepository implements IPermissionsRepository {
  async getMine(): Promise<Either<DomainError, string[]>> {
    const result = await httpClient.get<unknown>('/permissions/me')
    return result.flatMap(toPermissionCodes)
  }

  async getCatalog(): Promise<Either<DomainError, PermissionGroup[]>> {
    const result = await httpClient.get<unknown>('/permissions')
    return result.flatMap(toPermissionGroups)
  }
}
