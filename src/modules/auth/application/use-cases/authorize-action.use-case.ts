import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import type { AuthorizeDto } from '@/modules/auth/domain/dto/authorize-dto'
import type { AuthorizeResult } from '@/modules/auth/domain/responses/authorize-response'

/**
 * Autoriza uma ação sensível com as credenciais de um supervisor
 * (administrador/proprietário), sem alterar a sessão do operador logado.
 */
export class AuthorizeActionUseCase {
  private readonly repository: IAuthRepository

  constructor(repository: IAuthRepository) {
    this.repository = repository
  }

  execute(dto: AuthorizeDto): Promise<Either<DomainError, AuthorizeResult>> {
    return this.repository.authorize(dto)
  }
}
