import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListMembershipsUseCase } from '@/modules/memberships/application/use-cases/list-memberships.use-case'
import type { InviteUserUseCase } from '@/modules/memberships/application/use-cases/invite-user.use-case'
import type { UpdateMemberRoleUseCase } from '@/modules/memberships/application/use-cases/update-member-role.use-case'
import type { RemoveMemberUseCase } from '@/modules/memberships/application/use-cases/remove-member.use-case'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { InvitedUser } from '@/modules/memberships/domain/responses/invited-user'
import { InviteUserDto } from '@/modules/memberships/domain/dto/invite-user-dto'
import { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'
import type { MembershipRole } from '@/enums/membership-role.enum'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { StorageService } from '@/core/utils/storage'
import { useToast } from '@/shared/composables'

export class MembershipsController extends BaseController {
  private readonly listUseCase: ListMembershipsUseCase
  private readonly inviteUseCase: InviteUserUseCase
  private readonly updateRoleUseCase: UpdateMemberRoleUseCase
  private readonly removeUseCase: RemoveMemberUseCase

  private readonly authStore = useAuthStore()
  private readonly toast = useToast()

  readonly members = ref<Membership[]>([])
  readonly loaded = ref(false)
  readonly actingId = ref<string | null>(null)
  /** Resultado do último convite (mostra a senha provisória). */
  readonly invited = ref<InvitedUser | null>(null)

  constructor(
    listUseCase: ListMembershipsUseCase,
    inviteUseCase: InviteUserUseCase,
    updateRoleUseCase: UpdateMemberRoleUseCase,
    removeUseCase: RemoveMemberUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.inviteUseCase = inviteUseCase
    this.updateRoleUseCase = updateRoleUseCase
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

  /** Cria o usuário; em sucesso guarda `invited` (senha provisória) e recarrega. */
  async invite(input: {
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
    const dto = new InviteUserDto({
      name: input.name || undefined,
      email: input.email,
      role: input.role,
      companyId,
    })
    const result = await this.inviteUseCase.execute(dto)

    let ok = false
    this.handleResult(result, (invitedUser) => {
      this.invited.value = invitedUser
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
