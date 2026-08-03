import type { ICashSessionsRepository } from '@/modules/cash/domain/interfaces/i-cash-sessions-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { CashSession } from '@/modules/cash/domain/entities/cash-session.entity'
import type { CashMovement } from '@/modules/cash/domain/entities/cash-movement.entity'
import type { CashSessionList } from '@/modules/cash/domain/responses/cash-session-list-response'
import type { OpenCashSessionDto } from '@/modules/cash/domain/dto/open-cash-session-dto'
import type { CreateCashMovementDto } from '@/modules/cash/domain/dto/create-cash-movement-dto'
import type { CloseCashSessionDto } from '@/modules/cash/domain/dto/close-cash-session-dto'
import type { ListCashSessionsDto } from '@/modules/cash/domain/dto/list-cash-sessions-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toCashSession,
  toCashSessionOrNull,
  toCashSessionList,
  toCashMovement,
} from '@/modules/cash/data/mappers/cash-session.mapper'

export class CashSessionsRepository implements ICashSessionsRepository {
  async open(
    dto: OpenCashSessionDto,
  ): Promise<Either<DomainError, CashSession>> {
    const result = await httpClient.post<unknown>('/cash-sessions/open', {
      cashRegisterId: dto.cashRegisterId,
      openingAmount: dto.openingAmount,
    })
    return result.flatMap(toCashSession)
  }

  async getCurrent(): Promise<Either<DomainError, CashSession | null>> {
    const result = await httpClient.get<unknown>('/cash-sessions/current')
    return result.flatMap(toCashSessionOrNull)
  }

  async list(
    dto: ListCashSessionsDto,
  ): Promise<Either<DomainError, CashSessionList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.status) params.status = dto.status
    if (dto.cashRegisterId) params.cashRegisterId = dto.cashRegisterId
    if (dto.startDate) params.startDate = dto.startDate
    if (dto.endDate) params.endDate = dto.endDate

    const result = await httpClient.get<unknown>('/cash-sessions', { params })
    return result.flatMap(toCashSessionList)
  }

  async getById(id: string): Promise<Either<DomainError, CashSession>> {
    const result = await httpClient.get<unknown>(`/cash-sessions/${id}`)
    return result.flatMap(toCashSession)
  }

  async addMovement(
    id: string,
    dto: CreateCashMovementDto,
  ): Promise<Either<DomainError, CashMovement>> {
    const payload: Record<string, unknown> = {
      type: dto.type,
      amount: dto.amount,
    }
    if (dto.reason) payload.reason = dto.reason

    const result = await httpClient.post<unknown>(
      `/cash-sessions/${id}/movements`,
      payload,
    )
    return result.flatMap(toCashMovement)
  }

  async close(
    id: string,
    dto: CloseCashSessionDto,
  ): Promise<Either<DomainError, CashSession>> {
    const payload: Record<string, unknown> = { countedCash: dto.countedCash }
    if (dto.notes) payload.notes = dto.notes

    const result = await httpClient.post<unknown>(
      `/cash-sessions/${id}/close`,
      payload,
    )
    return result.flatMap(toCashSession)
  }
}
