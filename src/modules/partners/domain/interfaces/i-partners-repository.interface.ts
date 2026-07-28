import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Partner } from '@/modules/partners/domain/entities/partner.entity'
import type { PartnerList } from '@/modules/partners/domain/responses/partner-list-response'
import type { ListPartnersDto } from '@/modules/partners/domain/dto/list-partners-dto'
import type { CreatePartnerDto } from '@/modules/partners/domain/dto/create-partner-dto'
import type { UpdatePartnerDto } from '@/modules/partners/domain/dto/update-partner-dto'

export interface IPartnersRepository {
  list(dto: ListPartnersDto): Promise<Either<DomainError, PartnerList>>
  getById(id: string): Promise<Either<DomainError, Partner>>
  create(dto: CreatePartnerDto): Promise<Either<DomainError, Partner>>
  update(
    id: string,
    dto: UpdatePartnerDto,
  ): Promise<Either<DomainError, Partner>>
  remove(id: string): Promise<Either<DomainError, void>>
}
