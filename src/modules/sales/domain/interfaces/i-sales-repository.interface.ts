import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import type { SaleList } from '@/modules/sales/domain/responses/sale-list-response'
import type { SaleContext } from '@/modules/sales/domain/responses/sale-context-response'
import type { ListSalesDto } from '@/modules/sales/domain/dto/list-sales-dto'
import type {
  CreateSaleDto,
  CreateSalePaymentInput,
} from '@/modules/sales/domain/dto/create-sale-dto'
import type { UpdateSaleDto } from '@/modules/sales/domain/dto/update-sale-dto'

export interface ISalesRepository {
  list(dto: ListSalesDto): Promise<Either<DomainError, SaleList>>
  getContext(): Promise<Either<DomainError, SaleContext>>
  getById(id: string): Promise<Either<DomainError, Sale>>
  create(dto: CreateSaleDto): Promise<Either<DomainError, Sale>>
  update(id: string, dto: UpdateSaleDto): Promise<Either<DomainError, Sale>>
  confirm(
    id: string,
    payments?: CreateSalePaymentInput[],
  ): Promise<Either<DomainError, Sale>>
  cancel(id: string): Promise<Either<DomainError, Sale>>
  remove(id: string): Promise<Either<DomainError, void>>
}
