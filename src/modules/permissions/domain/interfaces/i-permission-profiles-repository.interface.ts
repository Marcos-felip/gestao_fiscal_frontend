import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type {
  PermissionProfile,
  ProfileRef,
} from '@/modules/permissions/domain/entities/permission-profile.entity'
import type { ProfileInputDto } from '@/modules/permissions/domain/dto/profile-input-dto'

export interface IPermissionProfilesRepository {
  list(): Promise<Either<DomainError, PermissionProfile[]>>
  create(dto: ProfileInputDto): Promise<Either<DomainError, PermissionProfile>>
  update(
    id: string,
    dto: ProfileInputDto,
  ): Promise<Either<DomainError, PermissionProfile>>
  remove(id: string): Promise<Either<DomainError, void>>
  setMemberProfiles(
    membershipId: string,
    profileIds: string[],
  ): Promise<Either<DomainError, ProfileRef[]>>
}
