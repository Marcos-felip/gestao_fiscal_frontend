import type { IPayablesRepository } from '@/modules/payables/domain/interfaces/i-payables-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Payable } from '@/modules/payables/domain/entities/payable.entity'
import type { PayableList } from '@/modules/payables/domain/responses/payable-list-response'
import type { ListPayablesDto } from '@/modules/payables/domain/dto/list-payables-dto'
import type { CreatePayableDto } from '@/modules/payables/domain/dto/create-payable-dto'
import type { PayPayableDto } from '@/modules/payables/domain/dto/pay-payable-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toPayable,
  toPayableArray,
  toPayableList,
} from '@/modules/payables/data/mappers/payable.mapper'

export class PayablesRepository implements IPayablesRepository {
  async list(dto: ListPayablesDto): Promise<Either<DomainError, PayableList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.status) params.status = dto.status
    if (dto.supplierId) params.supplierId = dto.supplierId
    if (dto.purchaseId) params.purchaseId = dto.purchaseId
    if (dto.overdue) params.overdue = 'true'
    if (dto.startDate) params.startDate = dto.startDate
    if (dto.endDate) params.endDate = dto.endDate

    const result = await httpClient.get<unknown>('/payables', { params })
    return result.flatMap(toPayableList)
  }

  async getById(id: string): Promise<Either<DomainError, Payable>> {
    const result = await httpClient.get<unknown>(`/payables/${id}`)
    return result.flatMap(toPayable)
  }

  async create(dto: CreatePayableDto): Promise<Either<DomainError, Payable[]>> {
    const payload: Record<string, unknown> = {
      description: dto.description,
      totalAmount: dto.totalAmount,
      dueDate: dto.dueDate,
    }
    if (dto.supplierId) payload.supplierId = dto.supplierId
    if (dto.installments !== undefined) payload.installments = dto.installments
    if (dto.intervalDays !== undefined) payload.intervalDays = dto.intervalDays
    if (dto.category) payload.category = dto.category

    const result = await httpClient.post<unknown>('/payables', payload)
    return result.flatMap(toPayableArray)
  }

  async pay(
    id: string,
    dto: PayPayableDto,
  ): Promise<Either<DomainError, Payable>> {
    const payload: Record<string, unknown> = { amount: dto.amount }
    if (dto.paidAt) payload.paidAt = dto.paidAt
    if (dto.method) payload.method = dto.method
    if (dto.notes) payload.notes = dto.notes

    const result = await httpClient.post<unknown>(`/payables/${id}/pay`, payload)
    return result.flatMap(toPayable)
  }

  async cancel(id: string): Promise<Either<DomainError, Payable>> {
    const result = await httpClient.post<unknown>(`/payables/${id}/cancel`, {})
    return result.flatMap(toPayable)
  }
}
