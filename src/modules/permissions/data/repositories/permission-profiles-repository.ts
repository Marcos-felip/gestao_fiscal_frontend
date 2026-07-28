import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { httpClient } from '@/core/client/http-client'
import type { IPermissionProfilesRepository } from '@/modules/permissions/domain/interfaces/i-permission-profiles-repository.interface'
import type {
  PermissionProfile,
  ProfileRef,
} from '@/modules/permissions/domain/entities/permission-profile.entity'
import type { ProfileInputDto } from '@/modules/permissions/domain/dto/profile-input-dto'
import {
  toPermissionProfile,
  toPermissionProfileList,
  toProfileRefs,
} from '@/modules/permissions/data/mappers/permission-profile.mapper'

export class PermissionProfilesRepository
  implements IPermissionProfilesRepository
{
  async list(): Promise<Either<DomainError, PermissionProfile[]>> {
    const result = await httpClient.get<unknown>('/permission-profiles')
    return result.flatMap(toPermissionProfileList)
  }

  async create(
    dto: ProfileInputDto,
  ): Promise<Either<DomainError, PermissionProfile>> {
    const result = await httpClient.post<unknown>(
      '/permission-profiles',
      this.toPayload(dto),
    )
    return result.flatMap(toPermissionProfile)
  }

  async update(
    id: string,
    dto: ProfileInputDto,
  ): Promise<Either<DomainError, PermissionProfile>> {
    const result = await httpClient.patch<unknown>(
      `/permission-profiles/${id}`,
      this.toPayload(dto),
    )
    return result.flatMap(toPermissionProfile)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/permission-profiles/${id}`)
  }

  async setMemberProfiles(
    membershipId: string,
    profileIds: string[],
  ): Promise<Either<DomainError, ProfileRef[]>> {
    const result = await httpClient.put<unknown>(
      `/memberships/${membershipId}/profiles`,
      { profileIds },
    )
    return result.flatMap(toProfileRefs)
  }

  /** Remove campos undefined do corpo da requisição. */
  private toPayload(dto: object): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) payload[key] = value
    }
    return payload
  }
}
