import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { BaseController } from './base-controller'
import { AuthRepository } from '@/modules/auth/data/auth-repository'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-cases/register.use-case'
import { useAuthStore } from '@/modules/auth/presenter/stores/auth-store'
export class AuthController extends BaseController {
  private readonly authRepository = new AuthRepository()
  private readonly loginUseCase = new LoginUseCase(this.authRepository)
  private readonly registerUseCase = new RegisterUseCase(this.authRepository)

  readonly email = ref('')
  readonly password = ref('')
  readonly name = ref('')

  private readonly authStore = useAuthStore()
  private readonly router = useRouter()

  async login(): Promise<void> {
    this.setLoading(true)
    const result = await this.loginUseCase.execute(this.email.value, this.password.value)
    this.handleEither(result, ({ token, user }) => {
      this.authStore.setToken(token)
      this.authStore.setUser(user)
      this.router.push('/')
    })
    this.setLoading(false)
  }

  async register(): Promise<void> {
    this.setLoading(true)
    const result = await this.registerUseCase.execute(this.name.value, this.email.value, this.password.value)
    this.handleEither(result, ({ token, user }) => {
      this.authStore.setToken(token)
      this.authStore.setUser(user)
      if (user.forcePasswordChange) {
        this.router.push('/change-password')
      } else {
        this.router.push('/')
      }
    })
    this.setLoading(false)
  }

  async logout(): Promise<void> {
    this.setLoading(true)
    const result = await this.authRepository.logout()
    this.handleEither(result, () => {
      this.authStore.clear()
      this.router.push('/login')
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