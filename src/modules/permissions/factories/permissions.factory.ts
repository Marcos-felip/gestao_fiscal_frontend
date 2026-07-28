import { PermissionRepository } from '@/modules/permissions/data/repositories/permission-repository'
import { PermissionProfilesRepository } from '@/modules/permissions/data/repositories/permission-profiles-repository'
import { GetMyPermissionsUseCase } from '@/modules/permissions/application/use-cases/get-my-permissions.use-case'
import { GetPermissionCatalogUseCase } from '@/modules/permissions/application/use-cases/get-permission-catalog.use-case'
import { GetRolePermissionsUseCase } from '@/modules/permissions/application/use-cases/get-role-permissions.use-case'
import { UpdateRolePermissionsUseCase } from '@/modules/permissions/application/use-cases/update-role-permissions.use-case'
import { ListProfilesUseCase } from '@/modules/permissions/application/use-cases/list-profiles.use-case'
import { CreateProfileUseCase } from '@/modules/permissions/application/use-cases/create-profile.use-case'
import { UpdateProfileUseCase } from '@/modules/permissions/application/use-cases/update-profile.use-case'
import { DeleteProfileUseCase } from '@/modules/permissions/application/use-cases/delete-profile.use-case'
import { SetMemberProfilesUseCase } from '@/modules/permissions/application/use-cases/set-member-profiles.use-case'
import { PermissionsMatrixController } from '@/modules/permissions/presentation/controllers/permissions-matrix-controller'
import { ProfilesController } from '@/modules/permissions/presentation/controllers/profiles-controller'
import { MemberProfilesController } from '@/modules/permissions/presentation/controllers/member-profiles-controller'

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

export function makeProfilesController(): ProfilesController {
  const permissions = new PermissionRepository()
  const profiles = new PermissionProfilesRepository()

  return new ProfilesController(
    new ListProfilesUseCase(profiles),
    new CreateProfileUseCase(profiles),
    new UpdateProfileUseCase(profiles),
    new DeleteProfileUseCase(profiles),
    new GetPermissionCatalogUseCase(permissions),
  )
}

export function makeMemberProfilesController(): MemberProfilesController {
  const profiles = new PermissionProfilesRepository()

  return new MemberProfilesController(
    new ListProfilesUseCase(profiles),
    new SetMemberProfilesUseCase(profiles),
  )
}
