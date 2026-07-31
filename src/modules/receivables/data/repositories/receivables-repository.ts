import type { IReceivablesRepository } from '@/modules/receivables/domain/interfaces/i-receivables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Receivable } from '@/modules/receivables/domain/entities/receivable.entity'
import type { ReceivableList } from '@/modules/receivables/domain/responses/receivable-list-response'
import type { ListReceivablesDto } from '@/modules/receivables/domain/dto/list-receivables-dto'
import type { CreateReceivableDto } from '@/modules/receivables/domain/dto/create-receivable-dto'
import type { PayReceivableDto } from '@/modules/receivables/domain/dto/pay-receivable-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toReceivable,
  toReceivableArray,
  toReceivableList,
} from '@/modules/receivables/data/mappers/receivable.mapper'

export class ReceivablesRepository implements IReceivablesRepository {
  async list(
    dto: ListReceivablesDto,
  ): Promise<Either<DomainError, ReceivableList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.status) params.status = dto.status
    if (dto.customerId) params.customerId = dto.customerId
    if (dto.saleId) params.saleId = dto.saleId
    if (dto.overdue) params.overdue = 'true'
    if (dto.startDate) params.startDate = dto.startDate
    if (dto.endDate) params.endDate = dto.endDate

    const result = await httpClient.get<unknown>('/receivables', { params })
    return result.flatMap(toReceivableList)
  }

  async getById(id: string): Promise<Either<DomainError, Receivable>> {
    const result = await httpClient.get<unknown>(`/receivables/${id}`)
    return result.flatMap(toReceivable)
  }

  async create(
    dto: CreateReceivableDto,
  ): Promise<Either<DomainError, Receivable[]>> {
    const payload: Record<string, unknown> = {
      description: dto.description,
      totalAmount: dto.totalAmount,
      dueDate: dto.dueDate,
    }
    if (dto.customerId) payload.customerId = dto.customerId
    if (dto.installments !== undefined) payload.installments = dto.installments
    if (dto.intervalDays !== undefined) payload.intervalDays = dto.intervalDays
    if (dto.category) payload.category = dto.category

    const result = await httpClient.post<unknown>('/receivables', payload)
    return result.flatMap(toReceivableArray)
  }

  async pay(
    id: string,
    dto: PayReceivableDto,
  ): Promise<Either<DomainError, Receivable>> {
    const payload: Record<string, unknown> = { amount: dto.amount }
    if (dto.paidAt) payload.paidAt = dto.paidAt
    if (dto.method) payload.method = dto.method
    if (dto.notes) payload.notes = dto.notes

    const result = await httpClient.post<unknown>(
      `/receivables/${id}/pay`,
      payload,
    )
    return result.flatMap(toReceivable)
  }

  async cancel(id: string): Promise<Either<DomainError, Receivable>> {
    const result = await httpClient.post<unknown>(
      `/receivables/${id}/cancel`,
      {},
    )
    return result.flatMap(toReceivable)
  }
}
