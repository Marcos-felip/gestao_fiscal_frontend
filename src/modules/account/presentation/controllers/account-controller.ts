import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { GetProfileUseCase } from '@/modules/account/application/use-cases/get-profile.use-case'
import type { UpdateProfileUseCase } from '@/modules/account/application/use-cases/update-profile.use-case'
import { UpdateProfileDto } from '@/modules/account/domain/dto/update-profile-dto'
import type { AccountProfile } from '@/modules/account/domain/entities/account-profile.entity'
import type { ProfileFormValues } from '@/modules/account/presentation/schemas/profile-schema'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { useToast } from '@/shared/composables'

export class AccountController extends BaseController {
  private readonly getUseCase: GetProfileUseCase
  private readonly updateUseCase: UpdateProfileUseCase
  private readonly authStore = useAuthStore()
  private readonly toast = useToast()

  readonly values = ref<ProfileFormValues>({ name: '', email: '' })
  readonly profile = ref<AccountProfile | null>(null)
  readonly loaded = ref(false)

  constructor(
    getUseCase: GetProfileUseCase,
    updateUseCase: UpdateProfileUseCase,
  ) {
    super()
    this.getUseCase = getUseCase
    this.updateUseCase = updateUseCase
  }

  async load(): Promise<void> {
    this.setLoading(true)
    // Semeia com o que já está na sessão para não piscar campos vazios.
    const current = this.authStore.user
    if (current) {
      this.values.value = { name: current.name, email: current.email }
    }

    const result = await this.getUseCase.execute()
    this.handleResult(result, (profile) => {
      this.profile.value = profile
      this.values.value = { name: profile.name, email: profile.email }
    })
    this.loaded.value = true
    this.setLoading(false)
  }

  async save(input: ProfileFormValues): Promise<void> {
    this.setLoading(true)
    const dto = new UpdateProfileDto({ name: input.name, email: input.email })
    const result = await this.updateUseCase.execute(dto)
    this.handleResult(result, (profile) => {
      this.profile.value = profile
      this.values.value = { name: profile.name, email: profile.email }
      this.syncAuthStore(profile)
      this.toast.success('Perfil atualizado com sucesso.')
    })
    this.setLoading(false)
  }

  /** Propaga nome/e-mail para a sessão (atualiza navbar, iniciais, etc.). */
  private syncAuthStore(profile: AccountProfile): void {
    const current = this.authStore.user
    if (!current) return
    this.authStore.setUser(
      new AuthUser(
        current.id,
        profile.name,
        profile.email,
        current.companyActiveId,
        current.role,
        current.forcePasswordChange,
      ),
    )
  }
}
