import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'

export interface IPermissionsRepository {
  /** Permissões efetivas do usuário autenticado (`GET /permissions/me`). */
  getMine(): Promise<Either<DomainError, string[]>>
  /** Catálogo agrupado por domínio (`GET /permissions`). */
  getCatalog(): Promise<Either<DomainError, PermissionGroup[]>>
}
