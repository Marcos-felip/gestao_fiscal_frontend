import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { ListProfilesUseCase } from '@/modules/permissions/application/use-cases/list-profiles.use-case'
import type { SetMemberProfilesUseCase } from '@/modules/permissions/application/use-cases/set-member-profiles.use-case'
import type {
  PermissionProfile,
  ProfileRef,
} from '@/modules/permissions/domain/entities/permission-profile.entity'
import { useToast } from '@/shared/composables'

/**
 * Suporta a atribuição de perfis a um membro (papel MEMBER) na tela de Usuários.
 * Lista os perfis disponíveis da empresa e grava o vínculo via `PUT`.
 */
export class MemberProfilesController extends BaseController {
  private readonly listUseCase: ListProfilesUseCase
  private readonly setUseCase: SetMemberProfilesUseCase
  private readonly toast = useToast()

  readonly profiles = ref<PermissionProfile[]>([])
  readonly loaded = ref(false)

  constructor(
    listUseCase: ListProfilesUseCase,
    setUseCase: SetMemberProfilesUseCase,
  ) {
    super()
    this.listUseCase = listUseCase
    this.setUseCase = setUseCase
  }

  async loadProfiles(): Promise<void> {
    this.setLoading(true)
    const result = await this.listUseCase.execute()
    this.handleResult(result, (items) => {
      this.profiles.value = items
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  /** Grava os perfis do membro; em sucesso devolve os vínculos resultantes. */
  async assign(
    membershipId: string,
    profileIds: string[],
  ): Promise<ProfileRef[] | null> {
    this.setLoading(true)
    const result = await this.setUseCase.execute(membershipId, profileIds)

    let refs: ProfileRef[] | null = null
    this.handleResult(result, (updated) => {
      refs = updated
      this.toast.success('Perfis do usuário atualizados.')
    })
    this.setLoading(false)
    return refs
  }
}
