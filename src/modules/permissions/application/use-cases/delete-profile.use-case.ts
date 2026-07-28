import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IPermissionProfilesRepository } from '@/modules/permissions/domain/interfaces/i-permission-profiles-repository.interface'

export class DeleteProfileUseCase {
  private readonly repository: IPermissionProfilesRepository

  constructor(repository: IPermissionProfilesRepository) {
    this.repository = repository
  }

  async execute(id: string): Promise<Either<DomainError, void>> {
    return this.repository.remove(id)
  }
}
