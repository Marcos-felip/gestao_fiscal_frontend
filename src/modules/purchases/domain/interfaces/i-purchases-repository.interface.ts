import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'
import type { PurchaseList } from '@/modules/purchases/domain/responses/purchase-list-response'
import type { ListPurchasesDto } from '@/modules/purchases/domain/dto/list-purchases-dto'
import type { CreatePurchaseDto } from '@/modules/purchases/domain/dto/create-purchase-dto'
import type { UpdatePurchaseDto } from '@/modules/purchases/domain/dto/update-purchase-dto'

export interface IPurchasesRepository {
  list(dto: ListPurchasesDto): Promise<Either<DomainError, PurchaseList>>
  getById(id: string): Promise<Either<DomainError, Purchase>>
  create(dto: CreatePurchaseDto): Promise<Either<DomainError, Purchase>>
  update(
    id: string,
    dto: UpdatePurchaseDto,
  ): Promise<Either<DomainError, Purchase>>
  confirm(id: string): Promise<Either<DomainError, Purchase>>
  cancel(id: string): Promise<Either<DomainError, Purchase>>
  remove(id: string): Promise<Either<DomainError, void>>
}
