import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListMembershipsUseCase } from '@/modules/memberships/application/use-cases/list-memberships.use-case'
import type { CreateUserUseCase } from '@/modules/memberships/application/use-cases/create-user.use-case'
import type { UpdateMemberRoleUseCase } from '@/modules/memberships/application/use-cases/update-member-role.use-case'
import type { EditUserUseCase } from '@/modules/memberships/application/use-cases/edit-user.use-case'
import type { RemoveMemberUseCase } from '@/modules/memberships/application/use-cases/remove-member.use-case'
import { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { CreatedUser } from '@/modules/memberships/domain/responses/created-user'
import { CreateUserDto } from '@/modules/memberships/domain/dto/create-user-dto'
import { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'
import { UpdateUserDto } from '@/modules/memberships/domain/dto/update-user-dto'
import type { MembershipRole } from '@/enums/membership-role.enum'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { StorageService } from '@/core/utils/storage'
import { useToast } from '@/shared/composables'

export class MembershipsController extends BaseController {
  private readonly listUseCase: ListMembershipsUseCase
  private readonly createUseCase: CreateUserUseCase
  private readonly updateRoleUseCase: UpdateMemberRoleUseCase
  private readonly editUseCase: EditUserUseCase
  private readonly removeUseCase: RemoveMemberUseCase

  private readonly authStore = useAuthStore()
  private readonly toast = useToast()

  readonly members = ref<Membership[]>([])
  readonly loaded = ref(false)
  readonly actingId = ref<string | null>(null)
  /** Resultado do último cadastro (mostra a senha provisória). */
  readonly created = ref<CreatedUser | null>(null)

  constructor(
    listUseCase: ListMembershipsUseCase,
    createUseCase: CreateUserUseCase,
    updateRoleUseCase: UpdateMemberRoleUseCase,
    editUseCase: EditUserUseCase,
    removeUseCase: RemoveMemberUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.createUseCase = createUseCase
    this.updateRoleUseCase = updateRoleUseCase
    this.editUseCase = editUseCase
    this.removeUseCase = removeUseCase
  }

  private get companyId(): string | null {
    return (
      this.authStore.user?.companyActiveId ??
      StorageService.getActiveCompanyId()
    )
  }

  async loadList(): Promise<void> {
    this.setLoading(true)
    const result = await this.listUseCase.execute()
    this.handleResult(result, (items) => {
      this.members.value = items
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /** Cria o usuário; em sucesso guarda `created` (senha provisória) e recarrega. */
  async create(input: {
    name?: string
    email: string
    role: MembershipRole
  }): Promise<boolean> {
    const companyId = this.companyId
    if (!companyId) {
      this.setError('Nenhuma empresa ativa selecionada.')
      return false
    }

    this.setLoading(true)
    const dto = new CreateUserDto({
      name: input.name || undefined,
      email: input.email,
      role: input.role,
      companyId,
    })
    const result = await this.createUseCase.execute(dto)

    let ok = false
    this.handleResult(result, (createdUser) => {
      this.created.value = createdUser
      ok = true
      void this.loadList()
    })
    this.setLoading(false)
    return ok
  }

  async changeRole(member: Membership, role: MembershipRole): Promise<void> {
    this.actingId.value = member.id
    this.setLoading(true)
    const result = await this.updateRoleUseCase.execute(
      member.id,
      new UpdateMemberRoleDto({ role }),
    )
    this.handleResult(result, (updated) => {
      this.members.value = this.members.value.map((m) =>
        m.id === updated.id ? updated : m,
      )
      this.toast.success('Papel atualizado.')
    })
    this.setLoading(false)
    this.actingId.value = null
  }

  async editUser(
    member: Membership,
    input: { name?: string; email?: string },
  ): Promise<boolean> {
    this.actingId.value = member.id
    this.setLoading(true)
    const dto = new UpdateUserDto({
      name: input.name || undefined,
      email: input.email || undefined,
    })
    const result = await this.editUseCase.execute(member.userId, dto)

    let ok = false
    this.handleResult(result, (updated) => {
      this.members.value = this.members.value.map((m) =>
        m.id === member.id
          ? new Membership(
              m.id,
              m.userId,
              m.role,
              updated.name,
              updated.email,
              m.createdAt,
            )
          : m,
      )
      this.toast.success('Usuário atualizado.')
      ok = true
    })
    this.setLoading(false)
    this.actingId.value = null
    return ok
  }

  async remove(member: Membership): Promise<void> {
    this.actingId.value = member.id
    this.setLoading(true)
    const result = await this.removeUseCase.execute(member.id)
    this.handleResult(result, () => {
      this.members.value = this.members.value.filter((m) => m.id !== member.id)
      this.toast.success('Membro removido.')
    })
    this.setLoading(false)
    this.actingId.value = null
  }
}
