import type { IPartnersRepository } from '@/modules/partners/domain/interfaces/i-partners-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { UpdatePartnerDto } from '@/modules/partners/domain/dto/update-partner-dto'

export class UpdatePartnerUseCase {
  private readonly repository: IPartnersRepository

  constructor(repository: IPartnersRepository) {
    this.repository = repository
  }

  async execute(
    id: string,
    dto: UpdatePartnerDto,
  ): Promise<Either<DomainError, Partner>> {
    return this.repository.update(id, dto)
  }
}
