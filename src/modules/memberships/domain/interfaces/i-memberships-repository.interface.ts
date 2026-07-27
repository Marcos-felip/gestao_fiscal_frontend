import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Membership } from '@/modules/memberships/domain/entities/membership.entity'
import type { InvitedUser } from '@/modules/memberships/domain/responses/invited-user'
import type { InviteUserDto } from '@/modules/memberships/domain/dto/invite-user-dto'
import type { UpdateMemberRoleDto } from '@/modules/memberships/domain/dto/update-member-role-dto'

export interface IMembershipsRepository {
  list(): Promise<Either<DomainError, Membership[]>>
  invite(dto: InviteUserDto): Promise<Either<DomainError, InvitedUser>>
  updateRole(
    id: string,
    dto: UpdateMemberRoleDto,
  ): Promise<Either<DomainError, Membership>>
  remove(id: string): Promise<Either<DomainError, void>>
}
