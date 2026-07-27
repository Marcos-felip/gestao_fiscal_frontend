import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { httpClient } from '@/core/client/http-client'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { InvitedUser } from '@/modules/memberships/domain/responses/invited-user'
import type { InviteUserDto } from '@/modules/memberships/domain/dto/invite-user-dto'
import type { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'
import {
  toMembership,
  toMembershipList,
  toInvitedUser,
} from '@/modules/memberships/data/mappers/membership.mapper'

export class MembershipsRepository implements IMembershipsRepository {
  async list(): Promise<Either<DomainError, Membership[]>> {
    const result = await httpClient.get<unknown>('/memberships')
    return result.flatMap(toMembershipList)
  }

  async invite(dto: InviteUserDto): Promise<Either<DomainError, InvitedUser>> {
    const result = await httpClient.post<unknown>('/users', this.toPayload(dto))
    return result.flatMap(toInvitedUser)
  }

  async updateRole(
    id: string,
    dto: UpdateMemberRoleDto,
  ): Promise<Either<DomainError, Membership>> {
    const result = await httpClient.patch<unknown>(`/memberships/${id}/role`, {
      role: dto.role,
    })
    return result.flatMap(toMembership)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/memberships/${id}`)
  }

  /** Remove campos undefined do corpo do POST. */
  private toPayload(dto: InviteUserDto): Record<string, unknown> {
    const payload: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(dto)) {
      if (value !== undefined) payload[key] = value
    }
    return payload
  }
}
