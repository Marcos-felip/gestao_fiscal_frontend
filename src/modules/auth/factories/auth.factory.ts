import { AuthRepository } from '@/modules/auth/data/repositories/auth-repository'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login.use-case'
import { RegisterUseCase } from '@/modules/auth/application/use-cases/register.use-case'
import { LogoutUseCase } from '@/modules/auth/application/use-cases/logout.use-case'
import { ChangePasswordFirstLoginUseCase } from '@/modules/auth/application/use-cases/change-password-first-login.use-case'
import { AuthorizeActionUseCase } from '@/modules/auth/application/use-cases/authorize-action.use-case'
import { AuthController } from '@/modules/auth/presentation/controllers/auth-controller'

export function makeAuthController(): AuthController {
  const authRepository = new AuthRepository()

  return new AuthController(
    new LoginUseCase(authRepository),
    new RegisterUseCase(authRepository),
    new LogoutUseCase(authRepository),
    new ChangePasswordFirstLoginUseCase(authRepository),
  )
}

/** Autorização de supervisor para ações sensíveis (ex.: cancelar venda). */
export function makeAuthorizeActionUseCase(): AuthorizeActionUseCase {
  return new AuthorizeActionUseCase(new AuthRepository())
}
