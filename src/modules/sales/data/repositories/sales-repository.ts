import type { ISalesRepository } from '@/modules/sales/domain/interfaces/i-sales-repository.interface'
import type { Either } from '@/core/either/either'
import type { DomainError } from '@/core/errors/domain-error'
import type { Sale } from '@/modules/sales/domain/entities/sale.entity'
import type { SaleList } from '@/modules/sales/domain/responses/sale-list-response'
import type { SaleContext } from '@/modules/sales/domain/responses/sale-context-response'
import type { ListSalesDto } from '@/modules/sales/domain/dto/list-sales-dto'
import type { CreateSaleDto } from '@/modules/sales/domain/dto/create-sale-dto'
import type { UpdateSaleDto } from '@/modules/sales/domain/dto/update-sale-dto'
import { httpClient } from '@/core/client/http-client'
import { toSale, toSaleList } from '@/modules/sales/data/mappers/sale.mapper'
import { toSaleContext } from '@/modules/sales/data/mappers/sale-context.mapper'

export class SalesRepository implements ISalesRepository {
  async list(dto: ListSalesDto): Promise<Either<DomainError, SaleList>> {
    const params: Record<string, string | number> = {
      page: dto.page,
      limit: dto.limit,
    }
    if (dto.status) params.status = dto.status
    if (dto.paymentStatus) params.paymentStatus = dto.paymentStatus
    if (dto.fiscalStatus) params.fiscalStatus = dto.fiscalStatus
    if (dto.customerId) params.customerId = dto.customerId
    if (dto.establishmentId) params.establishmentId = dto.establishmentId
    if (dto.startDate) params.startDate = dto.startDate
    if (dto.endDate) params.endDate = dto.endDate

    const result = await httpClient.get<unknown>('/sales', { params })
    return result.flatMap(toSaleList)
  }

  async getContext(): Promise<Either<DomainError, SaleContext>> {
    const result = await httpClient.get<unknown>('/sales/context')
    return result.flatMap(toSaleContext)
  }

  async getById(id: string): Promise<Either<DomainError, Sale>> {
    const result = await httpClient.get<unknown>(`/sales/${id}`)
    return result.flatMap(toSale)
  }

  async create(dto: CreateSaleDto): Promise<Either<DomainError, Sale>> {
    const payload: Record<string, unknown> = {
      establishmentId: dto.establishmentId,
      items: dto.items,
    }
    if (dto.customerId) payload.customerId = dto.customerId
    if (dto.discount !== undefined) payload.discount = dto.discount
    if (dto.paymentMethod) payload.paymentMethod = dto.paymentMethod
    if (dto.paymentCondition) payload.paymentCondition = dto.paymentCondition
    if (dto.installments !== undefined) payload.installments = dto.installments
    if (dto.firstDueDate) payload.firstDueDate = dto.firstDueDate
    if (dto.intervalDays !== undefined) payload.intervalDays = dto.intervalDays
    if (dto.notes) payload.notes = dto.notes
    if (dto.saleDate) payload.saleDate = dto.saleDate
    if (dto.confirm !== undefined) payload.confirm = dto.confirm

    const result = await httpClient.post<unknown>('/sales', payload)
    return result.flatMap(toSale)
  }

  async update(
    id: string,
    dto: UpdateSaleDto,
  ): Promise<Either<DomainError, Sale>> {
    const payload: Record<string, unknown> = {}
    if (dto.customerId !== undefined) payload.customerId = dto.customerId
    if (dto.items !== undefined) payload.items = dto.items
    if (dto.discount !== undefined) payload.discount = dto.discount
    if (dto.paymentMethod !== undefined) payload.paymentMethod = dto.paymentMethod
    if (dto.notes !== undefined) payload.notes = dto.notes
    if (dto.saleDate !== undefined) payload.saleDate = dto.saleDate
    if (dto.status !== undefined) payload.status = dto.status

    const result = await httpClient.patch<unknown>(`/sales/${id}`, payload)
    return result.flatMap(toSale)
  }

  async confirm(id: string): Promise<Either<DomainError, Sale>> {
    const result = await httpClient.post<unknown>(`/sales/${id}/confirm`, {})
    return result.flatMap(toSale)
  }

  async cancel(id: string): Promise<Either<DomainError, Sale>> {
    const result = await httpClient.post<unknown>(`/sales/${id}/cancel`, {})
    return result.flatMap(toSale)
  }

  async remove(id: string): Promise<Either<DomainError, void>> {
    return httpClient.delete<void>(`/sales/${id}`)
  }
}
