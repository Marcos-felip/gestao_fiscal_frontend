import { ref } from 'vue'
import { BaseController } from '@/core/controllers/base-controller'
import { AuthRepository } from '@/modules/auth/data/auth-repository'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-cases/register.use-case'
import { LoginDto } from '@/modules/auth/domain/dto/auth-dto'
import { RegisterDto } from '@/modules/auth/domain/dto/auth-dto'
import { useAuthStore } from '@/modules/auth/presenter/stores/auth-store'
import { routeNames } from '@/router/route-names'

export class AuthController extends BaseController {
  private readonly authRepository = new AuthRepository()
  private readonly loginUseCase = new LoginUseCase(this.authRepository)
  private readonly registerUseCase = new RegisterUseCase(this.authRepository)

  readonly email = ref('')
  readonly password = ref('')
  readonly name = ref('')

  private readonly authStore = useAuthStore()

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
    const dto = new RegisterDto(this.name.value, this.email.value, this.password.value)
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
    const result = await this.authRepository.logout()
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