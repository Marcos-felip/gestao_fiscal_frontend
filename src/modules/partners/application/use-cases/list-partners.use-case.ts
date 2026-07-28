import type { IPartnersRepository } from '@/modules/partners/domain/interfaces/i-partners-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { PartnerList } from '@/modules/partners/domain/responses/partner-list-response'
import type { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'

export class ListPartnersUseCase {
  private readonly repository: IPartnersRepository

  constructor(repository: IPartnersRepository) {
    this.repository = repository
  }

  async execute(
    dto: ListPartnersDto,
  ): Promise<Either<DomainError, PartnerList>> {
    return this.repository.list(dto)
  }
}
