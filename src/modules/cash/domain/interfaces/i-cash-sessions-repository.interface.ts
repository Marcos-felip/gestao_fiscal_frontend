import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import type { CashMovement } from '@/modules/cash/domain/entities/cash-movement.entity'
import type { CashSessionList } from '@/modules/cash/domain/responses/cash-session-list-response'
import type { OpenCashSessionDto } from '@/modules/cash/domain/dto/open-cash-session-dto'
import type { CreateCashMovementDto } from '@/modules/cash/domain/dto/create-cash-movement-dto'
import type { CloseCashSessionDto } from '@/modules/cash/domain/dto/close-cash-session-dto'
import type { ListCashSessionsDto } from '@/modules/cash/domain/dto/list-cash-sessions-dto'

export interface ICashSessionsRepository {
  open(dto: OpenCashSessionDto): Promise<Either<DomainError, CashSession>>
  /** Sessão aberta do operador logado, ou `null` se não houver. */
  getCurrent(): Promise<Either<DomainError, CashSession | null>>
  list(dto: ListCashSessionsDto): Promise<Either<DomainError, CashSessionList>>
  getById(id: string): Promise<Either<DomainError, CashSession>>
  addMovement(
    id: string,
    dto: CreateCashMovementDto,
  ): Promise<Either<DomainError, CashMovement>>
  close(
    id: string,
    dto: CloseCashSessionDto,
  ): Promise<Either<DomainError, CashSession>>
}
