import { AuthRepository } from '@/modules/auth/data/auth-repository'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-cases/register.use-case'
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case'
import { AuthController } from '@/modules/auth/presentation/controllers/auth-controller'

/**
 * Composition root do módulo auth.
 *
 * É o ÚNICO ponto que conhece as implementações concretas de `data/` e as liga
 * às camadas de cima — o ESLint proíbe qualquer arquivo fora de `factories/`
 * de importar `data/`.
 *
 * Deve ser chamada dentro de `<script setup>`: o BaseController usa
 * `useRouter()` e o controller usa `useAuthStore()`.
 */
export function makeAuthController(): AuthController {
  const authRepository = new AuthRepository()

  return new AuthController(
    new LoginUseCase(authRepository),
    new RegisterUseCase(authRepository),
    new LogoutUseCase(authRepository),
  )
}
