import { PermissionRepository } from '@/modules/permissions/data/repositories/permission-repository'
import { GetMyPermissionsUseCase } from '@/modules/permissions/application/use-cases/get-my-permissions.use-case'
import { GetPermissionCatalogUseCase } from '@/modules/permissions/application/use-cases/get-permission-catalog.use-case'
import { GetRolePermissionsUseCase } from '@/modules/permissions/application/use-cases/get-role-permissions.use-case'
import { UpdateRolePermissionsUseCase } from '@/modules/permissions/application/use-cases/update-role-permissions.use-case'
import { PermissionsMatrixController } from '@/modules/permissions/presentation/controllers/permissions-matrix-controller'

export function makeGetMyPermissionsUseCase(): GetMyPermissionsUseCase {
  return new GetMyPermissionsUseCase(new PermissionRepository())
}

export function makePermissionsMatrixController(): PermissionsMatrixController {
  const repository = new PermissionRepository()

  return new PermissionsMatrixController(
    new GetPermissionCatalogUseCase(repository),
    new GetRolePermissionsUseCase(repository),
    new UpdateRolePermissionsUseCase(repository),
  )
}
