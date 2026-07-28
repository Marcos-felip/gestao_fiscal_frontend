import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListProfilesUseCase } from '@/modules/permissions/application/use-cases/list-profiles.use-case'
import type { CreateProfileUseCase } from '@/modules/permissions/application/use-cases/create-profile.use-case'
import type { UpdateProfileUseCase } from '@/modules/permissions/application/use-cases/update-profile.use-case'
import type { DeleteProfileUseCase } from '@/modules/permissions/application/use-cases/delete-profile.use-case'
import type { GetPermissionCatalogUseCase } from '@/modules/permissions/application/use-cases/get-permission-catalog.use-case'
import type { PermissionProfile } from '@/modules/permissions/domain/entities/permission-profile.entity'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'
import { ProfileInputDto } from '@/modules/permissions/domain/dto/profile-input-dto'
import { useToast } from '@/shared/composables'

interface ProfileInput {
  name: string
  description?: string
  permissionCodes: string[]
}

export class ProfilesController extends BaseController {
  private readonly listUseCase: ListProfilesUseCase
  private readonly createUseCase: CreateProfileUseCase
  private readonly updateUseCase: UpdateProfileUseCase
  private readonly deleteUseCase: DeleteProfileUseCase
  private readonly getCatalogUseCase: GetPermissionCatalogUseCase
  private readonly toast = useToast()

  readonly profiles = ref<PermissionProfile[]>([])
  readonly catalog = ref<PermissionGroup[]>([])
  readonly loaded = ref(false)

  constructor(
    listUseCase: ListProfilesUseCase,
    createUseCase: CreateProfileUseCase,
    updateUseCase: UpdateProfileUseCase,
    deleteUseCase: DeleteProfileUseCase,
    getCatalogUseCase: GetPermissionCatalogUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.createUseCase = createUseCase
    this.updateUseCase = updateUseCase
    this.deleteUseCase = deleteUseCase
    this.getCatalogUseCase = getCatalogUseCase
  }

  async load(): Promise<void> {
    this.setLoading(true)
    const [profiles, catalog] = await Promise.all([
      this.listUseCase.execute(),
      this.getCatalogUseCase.execute(),
    ])
    this.handleResult(profiles, (items) => {
      this.profiles.value = items
    })
    if (catalog.isRight) this.catalog.value = catalog.right
    this.loaded.value = true
    this.setLoading(false)
  }

  async create(input: ProfileInput): Promise<boolean> {
    this.setLoading(true)
    const dto = new ProfileInputDto({
      name: input.name,
      description: input.description || undefined,
      permissionCodes: input.permissionCodes,
    })
    const result = await this.createUseCase.execute(dto)

    let ok = false
    this.handleResult(result, (created) => {
      this.profiles.value = [...this.profiles.value, created].sort((a, b) =>
        a.name.localeCompare(b.name),
      )
      this.toast.success('Perfil criado.')
      ok = true
    })
    this.setLoading(false)
    return ok
  }

  async update(profile: PermissionProfile, input: ProfileInput): Promise<boolean> {
    this.setLoading(true)
    const dto = new ProfileInputDto({
      name: input.name,
      description: input.description ?? '',
      permissionCodes: input.permissionCodes,
    })
    const result = await this.updateUseCase.execute(profile.id, dto)

    let ok = false
    this.handleResult(result, (updated) => {
      this.profiles.value = this.profiles.value
        .map((p) => (p.id === updated.id ? updated : p))
        .sort((a, b) => a.name.localeCompare(b.name))
      this.toast.success('Perfil atualizado.')
      ok = true
    })
    this.setLoading(false)
    return ok
  }

  async remove(profile: PermissionProfile): Promise<void> {
    this.setLoading(true)
    const result = await this.deleteUseCase.execute(profile.id)
    this.handleResult(result, () => {
      this.profiles.value = this.profiles.value.filter((p) => p.id !== profile.id)
      this.toast.success('Perfil excluído.')
    })
    this.setLoading(false)
  }
}
