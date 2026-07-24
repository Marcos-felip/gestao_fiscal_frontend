import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Establishment } from '@/modules/establishments/domain/entities/establishment.entity'
import type { CreateEstablishmentDto } from '@/modules/establishments/domain/dto/create-establishment-dto'
import type { UpdateEstablishmentDto } from '@/modules/establishments/domain/dto/update-establishment-dto'

export interface IEstablishmentRepository {
  list(): Promise<Either<DomainError, Establishment[]>>
  getById(id: string): Promise<Either<DomainError, Establishment>>
  create(
    dto: CreateEstablishmentDto,
  ): Promise<Either<DomainError, Establishment>>
  update(
    id: string,
    dto: UpdateEstablishmentDto,
  ): Promise<Either<DomainError, Establishment>>
  delete(id: string): Promise<Either<DomainError, void>>
}
