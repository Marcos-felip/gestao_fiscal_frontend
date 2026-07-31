import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'
import type { PayableList } from '@/modules/payables/domain/responses/payable-list-response'
import type { ListPayablesDto } from '@/modules/payables/domain/dto/list-payables-dto'
import type { CreatePayableDto } from '@/modules/payables/domain/dto/create-payable-dto'
import type { PayPayableDto } from '@/modules/payables/domain/dto/pay-payable-dto'

export interface IPayablesRepository {
  list(dto: ListPayablesDto): Promise<Either<DomainError, PayableList>>
  getById(id: string): Promise<Either<DomainError, Payable>>
  /** Cria N parcelas de um título avulso; devolve as parcelas geradas. */
  create(dto: CreatePayableDto): Promise<Either<DomainError, Payable[]>>
  pay(id: string, dto: PayPayableDto): Promise<Either<DomainError, Payable>>
  cancel(id: string): Promise<Either<DomainError, Payable>>
}
