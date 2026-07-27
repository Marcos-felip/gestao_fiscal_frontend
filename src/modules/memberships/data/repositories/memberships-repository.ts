import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import { httpClient } from '@/core/client/http-client'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { CreatedUser } from '@/modules/memberships/domain/responses/created-user'
import type { UpdatedUser } from '@/modules/memberships/domain/responses/updated-user'
import type { CreateUserDto } from '@/modules/memberships/domain/dto/create-user-dto'
import type { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'
import type { UpdateUserDto } from '@/modules/memberships/domain/dto/update-user-dto'
import {
  toMembership,
  toMembershipList,
  toCreatedUser,
  toUpdatedUser,
} from '@/modules/memberships/data/mappers/membership.mapper'

export class MembershipsRepository implements IMembershipsRepository {
  async list(): Promise<Either<DomainError, Membership[]>> {
    const result = await httpClient.get<unknown>('/memberships')
    return result.flatMap(toMembershipList)
  }

  async create(dto: CreateUserDto): Promise<Either<DomainError, CreatedUser>> {
    const result = await httpClient.post<unknown>('/users', this.toPayload(dto))
    return result.flatMap(toCreatedUser)
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

  async update(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<Either<DomainError, UpdatedUser>> {
    const result = await httpClient.patch<unknown>(
      `/users/${userId}`,
      this.toPayload(dto),
    )
    return result.flatMap(toUpdatedUser)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/memberships/${id}`)
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
