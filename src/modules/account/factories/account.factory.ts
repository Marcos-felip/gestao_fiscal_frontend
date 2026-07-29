import { AccountRepository } from '@/modules/account/data/repositories/account-repository'
import { GetProfileUseCase } from '@/modules/account/application/use-cases/get-profile.use-case'
import { UpdateProfileUseCase } from '@/modules/account/application/use-cases/update-profile.use-case'
import { AccountController } from '@/modules/account/presentation/controllers/account-controller'

export function makeAccountController(): AccountController {
  const repository = new AccountRepository()

  return new AccountController(
    new GetProfileUseCase(repository),
    new UpdateProfileUseCase(repository),
  )
}
