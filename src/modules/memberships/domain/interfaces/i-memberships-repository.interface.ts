import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { CreatedUser } from '@/modules/memberships/domain/responses/created-user'
import type { UpdatedUser } from '@/modules/memberships/domain/responses/updated-user'
import type { CreateUserDto } from '@/modules/memberships/domain/dto/create-user-dto'
import type { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'
import type { UpdateUserDto } from '@/modules/memberships/domain/dto/update-user-dto'

export interface IMembershipsRepository {
  list(): Promise<Either<DomainError, Membership[]>>
  create(dto: CreateUserDto): Promise<Either<DomainError, CreatedUser>>
  updateRole(
    id: string,
    dto: UpdateMemberRoleDto,
  ): Promise<Either<DomainError, Membership>>
  update(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<Either<DomainError, UpdatedUser>>
  remove(id: string): Promise<Either<DomainError, void>>
}
