import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import type { ReceivableList } from '@/modules/receivables/domain/responses/receivable-list-response'
import type { ListReceivablesDto } from '@/modules/receivables/domain/dto/list-receivables-dto'
import type { CreateReceivableDto } from '@/modules/receivables/domain/dto/create-receivable-dto'
import type { PayReceivableDto } from '@/modules/receivables/domain/dto/pay-receivable-dto'

export interface IReceivablesRepository {
  list(dto: ListReceivablesDto): Promise<Either<DomainError, ReceivableList>>
  getById(id: string): Promise<Either<DomainError, Receivable>>
  /** Cria N parcelas de um título avulso; devolve as parcelas geradas. */
  create(dto: CreateReceivableDto): Promise<Either<DomainError, Receivable[]>>
  pay(
    id: string,
    dto: PayReceivableDto,
  ): Promise<Either<DomainError, Receivable>>
  cancel(id: string): Promise<Either<DomainError, Receivable>>
}
