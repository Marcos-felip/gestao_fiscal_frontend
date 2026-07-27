import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetPermissionCatalogUseCase } from '@/modules/permissions/application/use-cases/get-permission-catalog.use-case'
import type { GetRolePermissionsUseCase } from '@/modules/permissions/application/use-cases/get-role-permissions.use-case'
import type { UpdateRolePermissionsUseCase } from '@/modules/permissions/application/use-cases/update-role-permissions.use-case'
import type { PermissionGroup } from '@/modules/permissions/domain/entities/permission-group.entity'
import { MembershipRole } from '@/enums/membership-role.enum'
import { useToast } from '@/shared/composables'

export class PermissionsMatrixController extends BaseController {
  private readonly getCatalogUseCase: GetPermissionCatalogUseCase
  private readonly getRoleUseCase: GetRolePermissionsUseCase
  private readonly updateRoleUseCase: UpdateRolePermissionsUseCase
  private readonly toast = useToast()

  readonly catalog = ref<PermissionGroup[]>([])
  readonly ownerSet = ref<Set<string>>(new Set())
  readonly adminSet = ref<Set<string>>(new Set())
  readonly memberSet = ref<Set<string>>(new Set())
  readonly loaded = ref(false)

  /** Conjunto salvo do MEMBER, para detectar alterações. */
  private baseline = new Set<string>()

  constructor(
    getCatalogUseCase: GetPermissionCatalogUseCase,
    getRoleUseCase: GetRolePermissionsUseCase,
    updateRoleUseCase: UpdateRolePermissionsUseCase,
  ) {
    super()
    this.getCatalogUseCase = getCatalogUseCase
    this.getRoleUseCase = getRoleUseCase
    this.updateRoleUseCase = updateRoleUseCase
  }

  get dirty(): boolean {
    return !this.setsEqual(this.memberSet.value, this.baseline)
  }

  async load(): Promise<void> {
    this.setLoading(true)
    const [catalog, owner, admin, member] = await Promise.all([
      this.getCatalogUseCase.execute(),
      this.getRoleUseCase.execute(MembershipRole.OWNER),
      this.getRoleUseCase.execute(MembershipRole.ADMIN),
      this.getRoleUseCase.execute(MembershipRole.MEMBER),
    ])

    this.handleResult(catalog, (groups) => {
      this.catalog.value = groups
    })
    if (owner.isRight) this.ownerSet.value = new Set(owner.right)
    if (admin.isRight) this.adminSet.value = new Set(admin.right)
    if (member.isRight) {
      this.memberSet.value = new Set(member.right)
      this.baseline = new Set(member.right)
    }

    this.loaded.value = true
    this.setLoading(false)
  }

  toggleMember(code: string): void {
    const next = new Set(this.memberSet.value)
    if (next.has(code)) next.delete(code)
    else next.add(code)
    this.memberSet.value = next
  }

  discard(): void {
    this.memberSet.value = new Set(this.baseline)
  }

  async save(): Promise<void> {
    this.setLoading(true)
    const result = await this.updateRoleUseCase.execute(
      MembershipRole.MEMBER,
      [...this.memberSet.value],
    )
    this.handleResult(result, (codes) => {
      this.memberSet.value = new Set(codes)
      this.baseline = new Set(codes)
      this.toast.success('Permissões do papel Membro atualizadas.')
    })
    this.setLoading(false)
  }

  private setsEqual(a: Set<string>, b: Set<string>): boolean {
    if (a.size !== b.size) return false
    for (const value of a) if (!b.has(value)) return false
    return true
  }
}
