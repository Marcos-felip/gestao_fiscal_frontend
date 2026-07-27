import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { MembershipRole } from '@/enums/membership-role.enum'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'

export interface IPermissionsRepository {
  /** Permissões efetivas do usuário autenticado (`GET /permissions/me`). */
  getMine(): Promise<Either<DomainError, string[]>>
  /** Catálogo agrupado por domínio (`GET /permissions`). */
  getCatalog(): Promise<Either<DomainError, PermissionGroup[]>>
  /** Códigos de um papel (`GET /permissions/:role`). */
  getByRole(role: MembershipRole): Promise<Either<DomainError, string[]>>
  /** Substitui as permissões de um papel (`PATCH /permissions/:role`). */
  updateRole(
    role: MembershipRole,
    codes: string[],
  ): Promise<Either<DomainError, string[]>>
}
