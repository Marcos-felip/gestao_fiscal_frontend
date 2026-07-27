import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IMembershipsRepository } from '@/modules/memberships/domain/interfaces/i-memberships-repository.interface'
import type { CreatedUser } from '@/modules/memberships/domain/responses/created-user'
import type { CreateUserDto } from '@/modules/memberships/domain/dto/create-user-dto'

export class CreateUserUseCase {
  private readonly repository: IMembershipsRepository

  constructor(repository: IMembershipsRepository) {
    this.repository = repository
  }

  async execute(dto: CreateUserDto): Promise<Either<DomainError, CreatedUser>> {
    return this.repository.create(dto)
  }
}
