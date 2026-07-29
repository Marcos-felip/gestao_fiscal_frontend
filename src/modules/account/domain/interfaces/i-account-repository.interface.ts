import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AccountProfile } from '@/modules/account/domain/entities/account-profile.entity'
import type { UpdateProfileDto } from '@/modules/account/domain/dto/update-profile-dto'

export interface IAccountRepository {
  getProfile(): Promise<Either<DomainError, AccountProfile>>
  updateProfile(
    dto: UpdateProfileDto,
  ): Promise<Either<DomainError, AccountProfile>>
}
