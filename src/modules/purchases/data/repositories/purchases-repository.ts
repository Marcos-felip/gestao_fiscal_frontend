import type { IPurchasesRepository } from '@/modules/purchases/domain/interfaces/i-purchases-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Purchase } from '@/modules/purchases/domain/entities/purchase.entity'
import type { PurchaseList } from '@/modules/purchases/domain/responses/purchase-list-response'
import type { ListPurchasesDto } from '@/modules/purchases/domain/dto/list-purchases-dto'
import type { CreatePurchaseDto } from '@/modules/purchases/domain/dto/create-purchase-dto'
import type { UpdatePurchaseDto } from '@/modules/purchases/domain/dto/update-purchase-dto'
import { httpClient } from '@/core/client/http-client'
import {
  toPurchase,
  toPurchaseList,
} from '@/modules/purchases/data/mappers/purchase.mapper'

export class PurchasesRepository implements IPurchasesRepository {
  async list(dto: ListPurchasesDto): Promise<Either<DomainError, PurchaseList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.status) params.status = dto.status
    if (dto.supplierId) params.supplierId = dto.supplierId
    if (dto.startDate) params.startDate = dto.startDate
    if (dto.endDate) params.endDate = dto.endDate

    const result = await httpClient.get<unknown>('/purchases', { params })
    return result.flatMap(toPurchaseList)
  }

  async getById(id: string): Promise<Either<DomainError, Purchase>> {
    const result = await httpClient.get<unknown>(`/purchases/${id}`)
    return result.flatMap(toPurchase)
  }

  async create(dto: CreatePurchaseDto): Promise<Either<DomainError, Purchase>> {
    const payload: Record<string, unknown> = {
      establishmentId: dto.establishmentId,
      items: dto.items,
    }
    if (dto.supplierId) payload.supplierId = dto.supplierId
    if (dto.paymentCondition) payload.paymentCondition = dto.paymentCondition
    if (dto.installments !== undefined) payload.installments = dto.installments
    if (dto.firstDueDate) payload.firstDueDate = dto.firstDueDate
    if (dto.intervalDays !== undefined) payload.intervalDays = dto.intervalDays
    if (dto.notes) payload.notes = dto.notes
    if (dto.purchaseDate) payload.purchaseDate = dto.purchaseDate

    const result = await httpClient.post<unknown>('/purchases', payload)
    return result.flatMap(toPurchase)
  }

  async update(
    id: string,
    dto: UpdatePurchaseDto,
  ): Promise<Either<DomainError, Purchase>> {
    const payload: Record<string, unknown> = {}
    if (dto.supplierId !== undefined) payload.supplierId = dto.supplierId
    if (dto.notes !== undefined) payload.notes = dto.notes
    if (dto.purchaseDate !== undefined) payload.purchaseDate = dto.purchaseDate

    const result = await httpClient.patch<unknown>(`/purchases/${id}`, payload)
    return result.flatMap(toPurchase)
  }

  async confirm(id: string): Promise<Either<DomainError, Purchase>> {
    const result = await httpClient.post<unknown>(`/purchases/${id}/confirm`, {})
    return result.flatMap(toPurchase)
  }

  async cancel(id: string): Promise<Either<DomainError, Purchase>> {
    const result = await httpClient.post<unknown>(`/purchases/${id}/cancel`, {})
    return result.flatMap(toPurchase)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/purchases/${id}`)
  }
}
