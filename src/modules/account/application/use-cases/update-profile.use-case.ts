import type { IAccountRepository } from '@/modules/account/domain/interfaces/i-account-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AccountProfile } from '@/modules/account/domain/entities/account-profile.entity'
import type { UpdateProfileDto } from '@/modules/account/domain/dto/update-profile-dto'

export class UpdateProfileUseCase {
  private readonly repository: IAccountRepository

  constructor(repository: IAccountRepository) {
    this.repository = repository
  }

  async execute(
    dto: UpdateProfileDto,
  ): Promise<Either<DomainError, AccountProfile>> {
    return this.repository.updateProfile(dto)
  }
}
