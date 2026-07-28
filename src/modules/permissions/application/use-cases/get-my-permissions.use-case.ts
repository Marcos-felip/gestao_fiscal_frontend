import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { IPermissionsRepository } from '@/modules/permissions/domain/interfaces/i-permissions-repository.interface'

export class GetMyPermissionsUseCase {
  private readonly repository: IPermissionsRepository

  constructor(repository: IPermissionsRepository) {
    this.repository = repository
  }

  async execute(): Promise<Either<DomainError, string[]>> {
    return this.repository.getMine()
  }
}
