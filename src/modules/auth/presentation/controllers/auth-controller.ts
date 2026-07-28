import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import type { RegisterUseCase } from '@/modules/auth/application/use-cases/register.use-case'
import type { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case'
import type { ChangePasswordFirstLoginUseCase } from '@/modules/auth/application/use-cases/change-password-first-login.use-case'
import { LoginDto } from '@/modules/auth/domain/dto/login-dto'
import { RegisterDto } from '@/modules/auth/domain/dto/register-dto'
import type { ChangePasswordDto } from '@/modules/auth/domain/dto/change-password-dto'
import { AuthUser } from '@/modules/auth/domain/entities/auth.entity'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { usePermissionsStore } from '@/modules/permissions/presentation/stores/permissions-store'
import { useToast } from '@/shared/composables'
import { routeNames } from '@/router/route-names'

export class AuthController extends BaseController {
  private readonly loginUseCase: LoginUseCase
  private readonly registerUseCase: RegisterUseCase
  private readonly logoutUseCase: LogoutUseCase
  private readonly changePasswordUseCase: ChangePasswordFirstLoginUseCase

  readonly email = ref('')
  readonly password = ref('')
  readonly name = ref('')

  private readonly authStore = useAuthStore()
  private readonly permissionsStore = usePermissionsStore()
  private readonly toast = useToast()

  constructor(
    loginUseCase: LoginUseCase,
    registerUseCase: RegisterUseCase,
    logoutUseCase: LogoutUseCase,
    changePasswordUseCase: ChangePasswordFirstLoginUseCase,
  ) {
    super()
    this.loginUseCase = loginUseCase
    this.registerUseCase = registerUseCase
    this.logoutUseCase = logoutUseCase
    this.changePasswordUseCase = changePasswordUseCase
  }

  async login(): Promise<void> {
    this.setLoading(true)

    const dto = new LoginDto(this.email.value, this.password.value)
    const result = await this.loginUseCase.execute(dto)

    await this.handleAuthSuccess(result)
    this.setLoading(false)
  }

  async register(): Promise<void> {
    this.setLoading(true)

    const dto = new RegisterDto(
      this.name.value,
      this.email.value,
      this.password.value,
    )
    const result = await this.registerUseCase.execute(dto)

    await this.handleAuthSuccess(result)
    this.setLoading(false)
  }

  async changePassword(dto: ChangePasswordDto): Promise<void> {
    this.setLoading(true)

    const result = await this.changePasswordUseCase.execute(dto)
    this.handleResult(result, () => {
      const current = this.authStore.user
      if (current) {
        this.authStore.setUser(
          new AuthUser(
            current.id,
            current.name,
            current.email,
            current.companyActiveId,
            current.role,
            false,
          ),
        )
      }
      this.toast.success('Senha atualizada com sucesso.')
      this.router.push({ name: routeNames.DASHBOARD })
    })
    this.setLoading(false)
  }

  async logout(): Promise<void> {
    this.setLoading(true)

    const result = await this.logoutUseCase.execute()

    this.handleResult(result, () => {
      this.authStore.clear()
      this.permissionsStore.clear()
      this.router.push({ name: routeNames.LOGIN })
    })
    this.setLoading(false)
  }

  resetForm(): void {
    this.email.value = ''
    this.password.value = ''
    this.name.value = ''
    this.clearError()
  }

  /**
   * Trata o sucesso de login/registro: guarda token e usuário, carrega as
   * permissões efetivas e roteia — forçando a troca de senha quando pendente.
   */
  private async handleAuthSuccess(
    result: Awaited<ReturnType<LoginUseCase['execute']>>,
  ): Promise<void> {
    if (result.isLeft) {
      this.handleResult(result, () => undefined)
      return
    }

    const { token, user } = result.right
    this.authStore.setToken(token)
    this.authStore.setUser(user)
    this.clearError()

    if (user.forcePasswordChange) {
      this.router.push({ name: routeNames.CHANGE_PASSWORD })
      return
    }

    await this.permissionsStore.load()
    this.router.push({ name: routeNames.DASHBOARD })
  }
}
