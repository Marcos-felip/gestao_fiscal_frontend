import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { InvitedUser } from '@/modules/memberships/domain/responses/invited-user'
import type { InviteUserDto } from '@/modules/memberships/domain/dto/invite-user-dto'

export class InviteUserUseCase {
  private readonly repository: IMembershipsRepository

  constructor(repository: IMembershipsRepository) {
    this.repository = repository
  }

  async execute(dto: InviteUserDto): Promise<Either<DomainError, InvitedUser>> {
    return this.repository.invite(dto)
  }
}
