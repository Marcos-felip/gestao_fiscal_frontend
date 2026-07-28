import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { UpdatedUser } from '@/modules/memberships/domain/responses/updated-user'
import type { UpdateUserDto } from '@/modules/memberships/domain/dto/update-user-dto'

export class EditUserUseCase {
  private readonly repository: IMembershipsRepository

  constructor(repository: IMembershipsRepository) {
    this.repository = repository
  }

  async execute(
    userId: string,
    dto: UpdateUserDto,
  ): Promise<Either<DomainError, UpdatedUser>> {
    return this.repository.update(userId, dto)
  }
}
