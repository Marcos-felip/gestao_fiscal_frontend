import type { IAccountRepository } from '@/modules/account/domain/interfaces/i-account-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { AccountProfile } from '@/modules/account/domain/entities/account-profile.entity'
import type { UpdateProfileDto } from '@/modules/account/domain/dto/update-profile-dto'
import { httpClient } from '@/core/client/http-client'
import { toAccountProfile } from '@/modules/account/data/mappers/account-profile.mapper'

export class AccountRepository implements IAccountRepository {
  async getProfile(): Promise<Either<DomainError, AccountProfile>> {
    const result = await httpClient.get<unknown>('/users/profile')
    return result.flatMap(toAccountProfile)
  }

  async updateProfile(
    dto: UpdateProfileDto,
  ): Promise<Either<DomainError, AccountProfile>> {
    const payload: Record<string, unknown> = {}
    if (dto.name !== undefined) payload.name = dto.name
    if (dto.email !== undefined) payload.email = dto.email

    const result = await httpClient.patch<unknown>('/users/profile', payload)
    return result.flatMap(toAccountProfile)
  }
}
