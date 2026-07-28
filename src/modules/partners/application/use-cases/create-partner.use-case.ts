import type { IPartnersRepository } from '@/modules/partners/domain/interfaces/i-partners-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { CreatePartnerDto } from '@/modules/partners/domain/dto/create-partner-dto'

export class CreatePartnerUseCase {
  private readonly repository: IPartnersRepository

  constructor(repository: IPartnersRepository) {
    this.repository = repository
  }

  async execute(dto: CreatePartnerDto): Promise<Either<DomainError, Partner>> {
    return this.repository.create(dto)
  }
}
