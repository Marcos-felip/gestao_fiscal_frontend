import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import type { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import type { RegisterUseCase } from '@/modules/auth/application/use-cases/register.use-case'
import type { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case'
import { LoginDto } from '@/modules/auth/domain/dto/login-dto'
import { RegisterDto } from '@/modules/auth/domain/dto/register-dto'
import { useAuthStore } from '@/modules/auth/presentation/stores/auth-store'
import { routeNames } from '@/router/route-names'

export class AuthController extends BaseController {
  private readonly loginUseCase: LoginUseCase
  private readonly registerUseCase: RegisterUseCase
  private readonly logoutUseCase: LogoutUseCase

  readonly email = ref('')
  readonly password = ref('')
  readonly name = ref('')

  private readonly authStore = useAuthStore()

  constructor(
    loginUseCase: LoginUseCase,
    registerUseCase: RegisterUseCase,
    logoutUseCase: LogoutUseCase,
  ) {
    super()
    this.loginUseCase = loginUseCase
    this.registerUseCase = registerUseCase
    this.logoutUseCase = logoutUseCase
  }

  async login(): Promise<void> {
    this.setLoading(true)

    const dto = new LoginDto(this.email.value, this.password.value)
    const result = await this.loginUseCase.execute(dto)

    this.handleResult(result, ({ token, user }) => {
      this.authStore.setToken(token)
      this.authStore.setUser(user)
      this.router.push({ name: routeNames.DASHBOARD })
    })
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

    this.handleResult(result, ({ token, user }) => {
      this.authStore.setToken(token)
      this.authStore.setUser(user)

      if (user.forcePasswordChange) {
        this.router.push('/change-password')
      } else {
        this.router.push({ name: routeNames.DASHBOARD })
      }
    })
    this.setLoading(false)
  }

  async logout(): Promise<void> {
    this.setLoading(true)

    const result = await this.logoutUseCase.execute()

    this.handleResult(result, () => {
      this.authStore.clear()
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
}
