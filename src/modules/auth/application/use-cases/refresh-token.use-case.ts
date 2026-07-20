import type { IAuthRepository } from '@/modules/auth/domain/interfaces/i-auth-repository.interface'
import { Either } from '@/core/either/either'
import type { AuthResult } from '@/modules/auth/domain/types/auth.types'
import type { RefreshTokenDto } from '@/modules/auth/domain/dto/auth-dto'

export class RefreshTokenUseCase {
  private readonly authRepository: IAuthRepository

  constructor(authRepository: IAuthRepository) {
    this.authRepository = authRepository
  }

  async execute(
    dto: RefreshTokenDto,
  ): Promise<Either<Error, AuthResult>> {
    return this.authRepository.refreshToken(dto)
  }
}
